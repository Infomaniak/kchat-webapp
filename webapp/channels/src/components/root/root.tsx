// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {NavigateMessage} from '@infomaniak/ksuite-bridge';
import {KSuiteBridge, NavigateMessageKey} from '@infomaniak/ksuite-bridge';
import * as Sentry from '@sentry/react';
import classNames from 'classnames';
import deepEqual from 'fast-deep-equal';
import React, {lazy} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import type {RouteComponentProps} from 'react-router-dom';

import {getUsage} from 'mattermost-redux/actions/cloud';
import {setSystemEmojis} from 'mattermost-redux/actions/emojis';
import {setUrl} from 'mattermost-redux/actions/general';
import {storeBridge, storeBridgeParam} from 'mattermost-redux/actions/ksuiteBridge';
import {Client4} from 'mattermost-redux/client';
import {getNextWcPack, openUpgradeDialog} from 'mattermost-redux/utils/plans_util';

import {measurePageLoadTelemetry, temporarilySetPageLoadContext, trackSelectorMetrics} from 'actions/telemetry_actions.jsx';
import {clearUserCookie} from 'actions/views/cookie';
import {setThemePreference} from 'actions/views/theme';
import {close, initialize} from 'actions/websocket_actions';
import BrowserStore from 'stores/browser_store';
import LocalStorageStore from 'stores/local_storage_store';
import store from 'stores/redux_store';

import {makeAsyncComponent, makeAsyncPluggableComponent} from 'components/async_load';
import GlobalHeader from 'components/global_header/global_header';
import {HFRoute} from 'components/header_footer_route/header_footer_route';
import LoggedIn from 'components/logged_in';
import LoggedInRoute from 'components/logged_in_route';
import {LAUNCHING_WORKSPACE_FULLSCREEN_Z_INDEX} from 'components/preparing_workspace/launching_workspace';
import {Animations} from 'components/preparing_workspace/steps';
import SidebarMobileRightMenu from 'components/sidebar_mobile_right_menu';

import {getHistory} from 'utils/browser_history';
import {DesktopThemePreferences, PageLoadContext, SCHEDULED_POST_URL_SUFFIX} from 'utils/constants';
import {IKConstants} from 'utils/constants-ik';
import DesktopApp from 'utils/desktop_api';
import {EmojiIndicesByAlias} from 'utils/emoji';
import {TEAM_NAME_PATH_PATTERN} from 'utils/path';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getSiteURL} from 'utils/url';
import {isInIframe} from 'utils/url-ksuite-redirect';
import {getDesktopVersion, isAndroidWeb, isChromebook, isDesktopApp, isIosWeb} from 'utils/user_agent';
import {applyTheme, injectWebcomponentInit, isTextDroppableEvent} from 'utils/utils';

import webSocketClient from 'client/web_websocket_client';
import {initializePlugins} from 'plugins';
import {LLMBotPost} from 'plugins/ai/components/llmbot_post';

import LuxonController from './luxon_controller';
import RootProvider from './root_provider';
import RootRedirect from './root_redirect';
import {WcKsuiteUpgradeModal} from './wc_ksuite_upgrade_modal';

import {checkIKTokenExpiresSoon, checkIKTokenIsExpired, clearLocalStorageToken, getChallengeAndRedirectToLogin, isDefaultAuthServer, refreshIKToken, storeTokenResponse} from '../login/utils';

import type {PropsFromRedux} from './index';

import 'plugins/export';
import 'utils/a11y_controller_instance';

const MobileViewWatcher = makeAsyncComponent('MobileViewWatcher', lazy(() => import('components/mobile_view_watcher')));
const WindowSizeObserver = makeAsyncComponent('WindowSizeObserver', lazy(() => import('components/window_size_observer/WindowSizeObserver')));
const ErrorPage = makeAsyncComponent('ErrorPage', lazy(() => import('components/error_page')));
const Login = makeAsyncComponent('LoginController', lazy(() => import('components/login/login')));
const AccessProblem = makeAsyncComponent('AccessProblem', lazy(() => import('components/access_problem')));

const PreparingWorkspace = makeAsyncComponent('PreparingWorkspace', lazy(() => import('components/preparing_workspace')));
const LaunchingWorkspace = makeAsyncComponent('LaunchingWorkspace', lazy(() => import('components/preparing_workspace/launching_workspace')));
const CompassThemeProvider = makeAsyncComponent('CompassThemeProvider', lazy(() => import('components/compass_theme_provider/compass_theme_provider')));
const TeamController = makeAsyncComponent('TeamController', lazy(() => import('components/team_controller')));
const AnnouncementBarController = makeAsyncComponent('AnnouncementBarController', lazy(() => import('components/announcement_bar')));
const SystemNotice = makeAsyncComponent('SystemNotice', lazy(() => import('components/system_notice')));

// const CloudEffects = makeAsyncComponent('CloudEffects', lazy(() => import('components/cloud_effects')));
const TeamSidebar = makeAsyncComponent('TeamSidebar', lazy(() => import('components/team_sidebar')));
const SidebarRight = makeAsyncComponent('SidebarRight', lazy(() => import('components/sidebar_right')));
const ModalController = makeAsyncComponent('ModalController', lazy(() => import('components/modal_controller')));
const AppBar = makeAsyncComponent('AppBar', lazy(() => import('components/app_bar/app_bar')));

const Pluggable = makeAsyncPluggableComponent();

const noop = () => {};

export type Props = PropsFromRedux & RouteComponentProps;

interface State {
    shouldMountAppRoutes?: boolean;
}

export default class Root extends React.PureComponent<Props, State> {
    private IKLoginCode: string | undefined;
    private headerResizerRef: React.RefObject<HTMLDivElement>;

    // Whether the app is running in an iframe.
    private embeddedInIFrame: boolean;
    themeMediaQuery: MediaQueryList;

    // The constructor adds a bunch of event listeners,
    // so we do need this.
    constructor(props: Props) {
        super(props);
        this.IKLoginCode = undefined;
        this.embeddedInIFrame = isInIframe();
        this.headerResizerRef = React.createRef();

        setUrl(getSiteURL());

        if (!isDesktopApp()) {
            Client4.setAuthHeader = false; // Disable auth header to enable CSRF check
        }

        setSystemEmojis(new Set(EmojiIndicesByAlias.keys()));

        this.state = {
            shouldMountAppRoutes: false,
        };

        this.themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        this.updateThemePreference(this.themeMediaQuery.matches);
    }

    componentDidMount() {
        temporarilySetPageLoadContext(PageLoadContext.PAGE_LOAD);

        if (isDesktopApp()) {
            // Rely on initial client calls to 401 for the first redirect to login,
            // we dont need to do it manually.
            // Login will send us back here with a code after we give it the challange.
            // Use code to refresh token.
            const loginCode = (new URLSearchParams(this.props.location.search)).get('code');

            if (loginCode) {
                console.log('[components/root] login with code'); // eslint-disable-line no-console
                this.storeLoginCode(loginCode);
                this.tryGetNewToken();
            } else {
                this.runMounted();
            }
        } else {
            // Allow through initial requests for web.
            this.runMounted();
        }

        if (this.themeMediaQuery?.addEventListener) {
            this.themeMediaQuery.addEventListener('change', this.handleThemeMediaQueryChangeEvent);
        }

        this.props.actions.registerCustomPostRenderer('custom_llmbot', LLMBotPost, 'llmbot_post_message_renderer');

        measurePageLoadTelemetry();
        trackSelectorMetrics();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (!deepEqual(prevProps.theme, this.props.theme) || !deepEqual(prevProps.currentTeam, this.props.currentTeam)) {
            // add body class for webcomponents theming
            if (document.body.className.match(/kchat-.+-theme/)) {
                document.body.className = document.body.className.replace(/kchat-.+-theme/, `kchat-${this.props.theme.ikType}-theme`);
            } else {
                document.body.className += ` kchat-${this.props.theme.ikType}-theme`;
            }

            if (isDesktopApp() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '3.2.0')) {
                window.postMessage({
                    type: 'preferred-theme',
                    data: {
                        theme: this.props.theme,
                        teamName: this.props.currentTeam?.display_name,
                    },
                }, window.origin);
            }

            this.applyTheme();
        }
        if (isDesktopApp() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '3.2.0')) {
            if (!deepEqual(prevProps.teamsOrderPreference, this.props.teamsOrderPreference)) {
                window.postMessage({
                    type: 'teams-order-preference',
                    data: this.props.teamsOrderPreference?.value,
                }, window.origin);
            }
            if (!deepEqual(prevProps.userLocale, this.props.userLocale)) {
                window.postMessage({
                    type: 'user-locale',
                    data: this.props.userLocale,
                }, window.origin);
            }
        }

        if (
            this.props.shouldShowAppBar !== prevProps.shouldShowAppBar ||
            this.props.rhsIsOpen !== prevProps.rhsIsOpen ||
            this.props.rhsIsExpanded !== prevProps.rhsIsExpanded
        ) {
            this.setRootMeta();
        }

        if (prevState.shouldMountAppRoutes === false && this.state.shouldMountAppRoutes === true) {
            if (!doesRouteBelongToTeamControllerRoutes(this.props.location.pathname)) {
                DesktopApp.reactAppInitialized();
            }
        }

        if (this.embeddedInIFrame && this.props.location !== prevProps.location) {
            this.sendBridgeNavigate();
        }
    }

    componentWillUnmount() {
        this.IKLoginCode = undefined;

        window.removeEventListener('storage', this.handleLogoutLoginSignal);
        document.removeEventListener('drop', this.handleDropEvent);
        document.removeEventListener('dragover', this.handleDragOverEvent);
    }

    onConfigLoaded = () => {
        Promise.all([
            this.props.actions.initializeProducts(),
            initializePlugins(),
        ]).then(() => {
            this.setState({shouldMountAppRoutes: true});
        });

        this.props.actions.migrateRecentEmojis();
        this.props.actions.loadRecentlyUsedCustomEmojis();

        this.showLandingPageIfNecessary();

        if (isDesktopApp() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '3.2.0')) {
            window.postMessage({
                type: 'preferred-theme',
                data: {
                    theme: this.props.theme,
                    teamName: this.props.currentTeam?.display_name,
                },
            }, window.origin);

            window.postMessage({
                type: 'teams-order-preference',
                data: this.props.teamsOrderPreference?.value,
            }, window.origin);

            window.postMessage({
                type: 'user-locale',
                data: this.props.userLocale,
            }, window.origin);
        }

        this.applyTheme();
    };

    private showLandingPageIfNecessary = () => {
        // Only show Landing Page if enabled
        if (!this.props.enableDesktopLandingPage) {
            return;
        }

        // We have nothing to redirect to if we're already on Desktop App
        // Chromebook has no Desktop App to switch to
        if (isDesktopApp() || isChromebook()) {
            return;
        }

        // Nothing to link to if we've removed the Android App download link
        if (isAndroidWeb() && !this.props.androidDownloadLink) {
            return;
        }

        // Nothing to link to if we've removed the iOS App download link
        if (isIosWeb() && !this.props.iosDownloadLink) {
            return;
        }

        // Nothing to link to if we've removed the Desktop App download link
        if (!this.props.appDownloadLink) {
            return;
        }

        // Only show the landing page once
        if (BrowserStore.hasSeenLandingPage()) {
            return;
        }

        // We don't want to show when resetting the password
        if (this.props.location.pathname === '/reset_password_complete') {
            return;
        }

        // We don't want to show when we're doing Desktop App external login
        if (this.props.location.pathname === '/login/desktop') {
            return;
        }

        // Stop this infinitely redirecting
        if (this.props.location.pathname.includes('/landing')) {
            return;
        }

        // Disabled to avoid breaking the CWS flow
        if (this.props.isCloud) {
            return;
        }

        // Disable for Rainforest tests
        if (window.location.hostname?.endsWith('.test.mattermost.com')) {
            return;
        }

        this.props.history.push('/landing#' + this.props.location.pathname + this.props.location.search);
        BrowserStore.setLandingPageSeen(true);
    };

    applyTheme() {
        // don't apply theme when in system console; system console hardcoded to THEMES.denim
        // AdminConsole will apply denim on mount re-apply user theme on unmount
        if (this.props.location.pathname.startsWith('/admin_console')) {
            return;
        }

        applyTheme(this.props.theme);
    }

    captureUTMParams() {
        const qs = new URLSearchParams(window.location.search);

        // list of key that we want to track
        const keys = ['utm_source', 'utm_medium', 'utm_campaign'];

        const campaign = keys.reduce((acc, key) => {
            if (qs.has(key)) {
                const value = qs.get(key);
                if (value) {
                    acc[key] = value;
                }
                qs.delete(key);
            }
            return acc;
        }, {} as Record<string, string>);

        if (Object.keys(campaign).length > 0) {
            this.props.history.replace({search: qs.toString()});
            return campaign;
        }
        return null;
    }

    initiateMeRequests = async () => {
        const {isLoaded} = await this.props.actions.loadConfigAndMe();

        if (isLoaded) {
            if (this.props.location.pathname === '/') {
                this.props.actions.redirectToOnboardingOrDefaultTeam(this.props.history);
            }
        }
        this.onConfigLoaded();
    };

    handleDropEvent = (e: DragEvent) => {
        if (e.dataTransfer && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].kind === 'file') {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    handleDragOverEvent = (e: DragEvent) => {
        if (!isTextDroppableEvent(e) && !document.body.classList.contains('focalboard-body')) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    storeLoginCode = (code: string) => {
        console.log('[components/root] store login code'); // eslint-disable-line no-console
        this.IKLoginCode = code;
    };

    tryGetNewToken = async () => {
        const challenge = JSON.parse(localStorage.getItem('challenge') as string);
        const loginCode = this.IKLoginCode;
        console.log('[component/root] try get token'); // eslint-disable-line no-console
        try { // Get new token
            const response: {
                expires_in?: number;
                access_token: string;
                refresh_token: string;
            } = await Client4.getIKLoginToken(
                loginCode as string,
                challenge?.challenge,
                challenge?.verifier,
                IKConstants.LOGIN_URL!,
                IKConstants.CLIENT_ID,
            );

            // Store in localstorage
            storeTokenResponse(response);

            // Remove challenge, loginCode and set logged in.
            localStorage.removeItem('challenge');
            localStorage.setItem('tokenExpired', '0');
            LocalStorageStore.setWasLoggedIn(true);
            this.IKLoginCode = undefined;

            let newToken;
            if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.1.0')) {
                newToken = {
                    token: response.access_token,
                };
            } else {
                if (response.expires_in === undefined) {
                    throw new Error('IKLoginToken response does not contain expires_in');
                }
                newToken = {
                    token: response.access_token,
                    refreshToken: response.refresh_token,
                    expiresAt: (Date.now() / 1000) + response.expires_in,
                };
            }

            // Store in desktop storage.
            window.postMessage(
                {
                    type: 'token-refreshed',
                    message: newToken,
                },
                window.origin,
            );

            // Allow through initial requests anyway to receive new errors
            this.runMounted();
        } catch (error) {
            console.log('[components/root] post token fail ', error); // eslint-disable-line no-console

            Sentry.captureException(new Error('Get token max error count. Redirect to login'));
            this.IKLoginCode = undefined;

            // Allow through initial requests anyway to receive new errors
            this.runMounted();
        }
    };

    // Does not run in 2.1 and up
    doTokenCheck = () => {
        // If expiring soon but not expired, refresh before we start hitting errors.
        if (checkIKTokenExpiresSoon() && !checkIKTokenIsExpired()) {
            console.log('[components/root] desktop token expiring soon'); // eslint-disable-line no-console
            refreshIKToken(/*redirectToReam*/false)?.then(() => {
                console.log('[components/root] desktop token refreshed'); // eslint-disable-line no-console
                close();
                initialize();
            }).catch((e: unknown) => {
                console.warn('[components/root] desktop token refresh error: ', e); // eslint-disable-line no-console
            });
        }
    };

    sendBridgeNavigate = () => {
        const {ksuiteBridge, location} = this.props;
        ksuiteBridge?.sendMessage({type: NavigateMessageKey, path: location.pathname});
    };

    runMounted = () => {
        const token = localStorage.getItem('IKToken');

        if (isDesktopApp()) {
            if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.1.0')) {
                if (isDefaultAuthServer() && !token) {
                    getChallengeAndRedirectToLogin(true);
                    console.log('[components/root] redirect to login'); // eslint-disable-line no-console
                    return;
                }

                window.WC_TOKEN = token;
            }
        }

        // Binds a handler for unexpected session loss on desktop, web will follow api redirect.
        Client4.bindEmitUserLoggedOutEvent(async (data) => {
            // eslint-disable-next-line no-negated-condition
            if (!isDesktopApp()) {
                if (this.embeddedInIFrame) {
                    window.open(window.location.href, '_top');
                } else {
                    window.location.href = data.uri;
                }
            } else {
                const lsToken = localStorage.getItem('IKToken');
                if (lsToken) {
                    // Delete the token if it still exists.
                    clearLocalStorageToken();
                    clearUserCookie();
                    await window.authManager?.logout();
                }
            }
        });

        // Bind a handler for unexpected "out of quota" situations.
        // This is rare and usually caused by either a race condition between two events (of differents user)
        // before usage data is refreshed, or a failure in the 'quota-changed' websocket event.
        // In such cases, we show the upgrade modal and refetch usage to ensure the user
        // gets blocked before exceeding their quota.
        Client4.bindOutOfQuotaEvent(() => {
            store.dispatch(getUsage());
            const nextPack = getNextWcPack(this.props.currentPack);
            openUpgradeDialog(nextPack);
        });

        const ksuiteBridge = new KSuiteBridge({debugPrefix: 'kchat'}); // eslint-disable-line no-process-env
        storeBridge(ksuiteBridge)(store.dispatch, store.getState);

        // this message listener is outside the store because of how is handled navigation
        ksuiteBridge.on(NavigateMessageKey, (navigateMessage: NavigateMessage) => {
            getHistory().push(navigateMessage.path);
        });

        const ksuiteMode = (new URLSearchParams(window.location.search)).get('ksuite-mode');
        const spaceId = (new URLSearchParams(window.location.search)).get('space-id');

        if (ksuiteMode) {
            storeBridgeParam('ksuiteMode', ksuiteMode)(store.dispatch);
        }

        if (spaceId) {
            storeBridgeParam('spaceId', spaceId)(store.dispatch);
        }

        injectWebcomponentInit();
        this.initiateMeRequests();

        if (!isDesktopApp() && (window.location.hash || '').endsWith('/notifications-settings')) {
            customElements.whenDefined('module-settings-component').then(() => {
                document.dispatchEvent(new CustomEvent('openSettings', {
                    detail: ['ksuite-kchat', 'ksuite-kchat-personalization'],
                }));
            }).catch((error) => {
                // eslint-disable-next-line no-console
                console.error('[channel_controller] Error waiting for wc-settings:', error);
            });
        }

        // Force logout of all tabs if one tab is logged out
        window.addEventListener('storage', this.handleLogoutLoginSignal);

        // Prevent drag and drop files from navigating away from the app
        document.addEventListener('drop', this.handleDropEvent);

        document.addEventListener('dragover', this.handleDragOverEvent);
    };

    handleLogoutLoginSignal = (e: StorageEvent) => {
        this.props.actions.handleLoginLogoutSignal(e);
    };

    handleThemeMediaQueryChangeEvent = (e: MediaQueryListEvent) => {
        this.updateThemePreference(e.matches);
    };

    updateThemePreference = (isDark: boolean) => {
        store.dispatch(setThemePreference(isDark ? DesktopThemePreferences.DARK : DesktopThemePreferences.LIGHT));
    };

    setRootMeta = () => {
        const root = document.getElementById('root')!;

        for (const [className, enabled] of Object.entries({
            'app-bar-enabled': this.props.shouldShowAppBar,
            'rhs-open': this.props.rhsIsOpen,
            'rhs-open-expanded': this.props.rhsIsExpanded,
        })) {
            root.classList.toggle(className, enabled);
        }
    };

    render() {
        if (!this.state.shouldMountAppRoutes) {
            return <div/>;
        }

        return (
            <RootProvider>
                <MobileViewWatcher/>
                <LuxonController/>
                <WcKsuiteUpgradeModal/>
                <Switch>
                    <Route
                        path={'/error'}
                        component={ErrorPage}
                    />
                    <Route
                        path={'/login'}
                        component={Login}
                    />
                    <HFRoute
                        path={'/access_problem'}
                        component={AccessProblem}
                    />
                    <LoggedInRoute
                        headerRef={this.headerResizerRef}
                        path={'/preparing-workspace'}
                        component={PreparingWorkspace}
                    />
                    <Redirect
                        from={'/_redirect/integrations/:subpath*'}
                        to={`/${this.props.permalinkRedirectTeamName}/integrations/:subpath*`}
                    />
                    <Redirect
                        from={'/_redirect/pl/:postid'}
                        to={`/${this.props.permalinkRedirectTeamName}/pl/:postid`}
                    />
                    <CompassThemeProvider theme={this.props.theme}>
                        {(this.props.showLaunchingWorkspace && !this.props.location.pathname.includes('/preparing-workspace') &&
                            <LaunchingWorkspace
                                fullscreen={true}
                                zIndex={LAUNCHING_WORKSPACE_FULLSCREEN_Z_INDEX}
                                show={true}
                                onPageView={noop}
                                transitionDirection={Animations.Reasons.EnterFromBefore}
                            />
                        )}
                        <WindowSizeObserver/>
                        <ModalController/>
                        <AnnouncementBarController/>
                        <SystemNotice/>
                        <GlobalHeader headerRef={this.headerResizerRef}/>
                        {!this.embeddedInIFrame && isDesktopApp() && !isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '3.2.0') && <TeamSidebar/>}
                        <div className='main-wrapper'>
                            <Switch>
                                {this.props.products?.filter((product) => Boolean(product.publicComponent)).map((product) => (
                                    <Route
                                        key={`${product.id}-public`}
                                        path={`${product.baseURL}/public`}
                                        render={(props) => {
                                            return (
                                                <Pluggable
                                                    pluggableName={'Product'}
                                                    subComponentName={'publicComponent'}
                                                    pluggableId={product.id}
                                                    css={{gridArea: 'center'}}
                                                    {...props}
                                                />
                                            );
                                        }}
                                    />
                                ))}
                                {this.props.products?.map((product) => (
                                    <Route
                                        key={product.id}
                                        path={product.baseURL}
                                        render={(props) => {
                                            let pluggable = (
                                                <Pluggable
                                                    pluggableName={'Product'}
                                                    subComponentName={'mainComponent'}
                                                    pluggableId={product.id}
                                                    webSocketClient={webSocketClient}
                                                    css={product.wrapped ? undefined : {gridArea: 'center'}}
                                                />
                                            );
                                            if (product.wrapped) {
                                                pluggable = (
                                                    <div className={classNames(['product-wrapper', {wide: !product.showTeamSidebar}])}>
                                                        {pluggable}
                                                    </div>
                                                );
                                            }
                                            return (
                                                <LoggedIn {...props}>
                                                    {pluggable}
                                                </LoggedIn>
                                            );
                                        }}
                                    />
                                ))}
                                {this.props.plugins?.map((plugin) => (
                                    <Route
                                        key={plugin.id}
                                        path={'/plug/' + plugin.route}
                                        render={() => (
                                            <Pluggable
                                                pluggableName={'CustomRouteComponent'}
                                                pluggableId={plugin.id}
                                                css={{gridArea: 'center'}}
                                            />
                                        )}
                                    />
                                ))}
                                <LoggedInRoute
                                    headerRef={this.headerResizerRef}
                                    theme={this.props.theme}
                                    path={`/:team(${TEAM_NAME_PATH_PATTERN})`}
                                    component={TeamController}
                                />
                                <RootRedirect/>
                            </Switch>
                            <SidebarRight/>
                        </div>
                        <Pluggable pluggableName='Global'/>
                        <AppBar/>
                        <SidebarMobileRightMenu/>
                    </CompassThemeProvider>
                </Switch>
            </RootProvider>
        );
    }
}

export function doesRouteBelongToTeamControllerRoutes(pathname: RouteComponentProps['location']['pathname']): boolean {
    // Note: we have specifically added admin_console to the negative lookahead as admin_console can have integrations as subpaths (admin_console/integrations/bot_accounts)
    // and we don't want to treat those as team controller routes.
    const TEAM_CONTROLLER_PATH_PATTERN = new RegExp(`^/([a-z0-9\\-_]+)/(channels|messages|threads|drafts|integrations|emoji|${SCHEDULED_POST_URL_SUFFIX})(/.*)?$`);

    return TEAM_CONTROLLER_PATH_PATTERN.test(pathname);
}
