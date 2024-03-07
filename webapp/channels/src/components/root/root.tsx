// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {KSuiteBridge, NavigateMessageKey} from '@infomaniak/ksuite-bridge';
import * as Sentry from '@sentry/react';
import classNames from 'classnames';
import deepEqual from 'fast-deep-equal';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import type {RouteComponentProps} from 'react-router-dom';

import {ServiceEnvironment} from '@mattermost/types/config';
import type {UserProfile} from '@mattermost/types/users';

import {setSystemEmojis} from 'mattermost-redux/actions/emojis';
import {setUrl} from 'mattermost-redux/actions/general';
import {Client4} from 'mattermost-redux/client';
import {rudderAnalytics, RudderTelemetryHandler} from 'mattermost-redux/client/rudder';
import {General} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import type {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {getIsOnboardingFlowEnabled, getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';
import {getActiveTeamsList} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, isCurrentUserSystemAdmin, checkIsFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import type {ActionResult} from 'mattermost-redux/types/actions';

import {setCallListeners} from 'actions/calls';
import {loadRecentlyUsedCustomEmojis} from 'actions/emoji_actions';
import * as GlobalActions from 'actions/global_actions';
import {storeBridge} from 'actions/ksuite_bridge_actions';
import {measurePageLoadTelemetry, temporarilySetPageLoadContext, trackEvent, trackSelectorMetrics} from 'actions/telemetry_actions.jsx';
import {clearUserCookie} from 'actions/views/cookie';
import {close, initialize} from 'actions/websocket_actions';
import LocalStorageStore from 'stores/local_storage_store';
import store from 'stores/redux_store';

import AccessProblem from 'components/access_problem';
import AnnouncementBarController from 'components/announcement_bar';
import AppBar from 'components/app_bar/app_bar';
import {makeAsyncComponent} from 'components/async_load';
import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';
import OpenPluginInstallPost from 'components/custom_open_plugin_install_post_renderer';
import OpenPricingModalPost from 'components/custom_open_pricing_modal_post_renderer';
import GlobalHeader from 'components/global_header/global_header';
import {HFRoute} from 'components/header_footer_route/header_footer_route';
import {HFTRoute} from 'components/header_footer_template_route';
import MobileViewWatcher from 'components/mobile_view_watcher';
import ModalController from 'components/modal_controller';
import LaunchingWorkspace, {LAUNCHING_WORKSPACE_FULLSCREEN_Z_INDEX} from 'components/preparing_workspace/launching_workspace';
import {Animations} from 'components/preparing_workspace/steps';
import SidebarRight from 'components/sidebar_right';
import SidebarRightMenu from 'components/sidebar_right_menu';
import SystemNotice from 'components/system_notice';
import TeamSidebar from 'components/team_sidebar';
import WindowSizeObserver from 'components/window_size_observer/WindowSizeObserver';

import A11yController from 'utils/a11y_controller';
import {PageLoadContext, StoragePrefixes} from 'utils/constants';
import {IKConstants} from 'utils/constants-ik';
import {EmojiIndicesByAlias} from 'utils/emoji';
import {TEAM_NAME_PATH_PATTERN} from 'utils/path';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getSiteURL} from 'utils/url';
import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils';

import webSocketClient from 'client/web_websocket_client';
import {initializePlugins} from 'plugins';
import Pluggable from 'plugins/pluggable';

import type {ProductComponent, PluginComponent} from 'types/store/plugins';

import {applyLuxonDefaults} from './effects';
import RootProvider from './root_provider';
import RootRedirect from './root_redirect';

import {checkIKTokenExpiresSoon, checkIKTokenIsExpired, clearLocalStorageToken, getChallengeAndRedirectToLogin, isDefaultAuthServer, refreshIKToken, storeTokenResponse} from '../login/utils';

import 'plugins/export.js';

const LazyErrorPage = React.lazy(() => import('components/error_page'));
const LazyLogin = React.lazy(() => import('components/login/login'));

// const LazyAdminConsole = React.lazy(() => import('components/admin_console'));
const LazyLoggedIn = React.lazy(() => import('components/logged_in'));

// const LazyPasswordResetSendLink = React.lazy(() => import('components/password_reset_send_link'));
// const LazyPasswordResetForm = React.lazy(() => import('components/password_reset_form'));
// const LazySignup = React.lazy(() => import('components/signup/signup'));
// const LazyTermsOfService = React.lazy(() => import('components/terms_of_service'));
// const LazyShouldVerifyEmail = React.lazy(() => import('components/should_verify_email/should_verify_email'));
// const LazyDoVerifyEmail = React.lazy(() => import('components/do_verify_email/do_verify_email'));
// const LazyClaimController = React.lazy(() => import('components/claim'));
// const LazyLinkingLandingPage = React.lazy(() => import('components/linking_landing_page'));
// const LazySelectTeam = React.lazy(() => import('components/select_team'));
// const LazyAuthorize = React.lazy(() => import('components/authorize'));
// const LazyCreateTeam = React.lazy(() => import('components/create_team'));
// const LazyMfa = React.lazy(() => import('components/mfa/mfa_controller'));
const LazyPreparingWorkspace = React.lazy(() => import('components/preparing_workspace'));
const LazyTeamController = React.lazy(() => import('components/team_controller'));
const LazyOnBoardingTaskList = React.lazy(() => import('components/onboarding_tasklist'));

const ErrorPage = makeAsyncComponent('ErrorPage', LazyErrorPage);
const Login = makeAsyncComponent('LoginController', LazyLogin);
const LoggedIn = makeAsyncComponent('LoggedIn', LazyLoggedIn);

const PreparingWorkspace = makeAsyncComponent('PreparingWorkspace', LazyPreparingWorkspace);
const TeamController = makeAsyncComponent('TeamController', LazyTeamController);
const OnBoardingTaskList = makeAsyncComponent('OnboardingTaskList', LazyOnBoardingTaskList);

const MAX_GET_TOKEN_FAILS = 5;
const MIN_GET_TOKEN_RETRY_TIME = 2000; // 2 sec

// const SelectTeam = makeAsyncComponent('SelectTeam', LazySelectTeam);
// const DoVerifyEmail = makeAsyncComponent('DoVerifyEmail', LazyDoVerifyEmail);
// const ClaimController = makeAsyncComponent('ClaimController', LazyClaimController);
// const PasswordResetForm = makeAsyncComponent('PasswordResetForm', LazyPasswordResetForm);
// const ShouldVerifyEmail = makeAsyncComponent('ShouldVerifyEmail', LazyShouldVerifyEmail);
// const PasswordResetSendLink = makeAsyncComponent('PasswordResedSendLink', LazyPasswordResetSendLink);
// const Signup = makeAsyncComponent('SignupController', LazySignup);
// const TermsOfService = makeAsyncComponent('TermsOfService', LazyTermsOfService);
// const CreateTeam = makeAsyncComponent('CreateTeam', LazyCreateTeam);
// const AdminConsole = makeAsyncComponent('AdminConsole', LazyAdminConsole);
// const Authorize = makeAsyncComponent('Authorize', LazyAuthorize);
// const DelinquencyModalController = makeAsyncComponent('DelinquencyModalController', LazyDelinquencyModalController);

type LoggedInRouteProps = {
    component: React.ComponentType<RouteComponentProps<any>>;
    path: string | string[];
    theme?: Theme; // the routes that send the theme are the ones that will actually need to show the onboarding tasklist
    headerRef: React.RefObject<HTMLDivElement>; // IK: ref used for resisizng global header left controls when lhs is resized by user.
};

function LoggedInRoute(props: LoggedInRouteProps) {
    const {component: Component, theme, headerRef, ...rest} = props;
    return (
        <Route
            {...rest}
            render={(routeProps) => (
                <LoggedIn {...routeProps}>
                    {theme && <CompassThemeProvider theme={theme}>
                        <OnBoardingTaskList/>
                    </CompassThemeProvider>}
                    <Component
                        {...(routeProps)}
                        headerRef={headerRef}
                    />
                </LoggedIn>
            )}
        />
    );
}

const noop = () => {};

export type Actions = {
    getFirstAdminSetupComplete: () => Promise<ActionResult>;
    getProfiles: (page?: number, pageSize?: number, options?: Record<string, any>) => Promise<ActionResult>;
    migrateRecentEmojis: () => void;
    loadConfigAndMe: () => Promise<ActionResult>;
    registerCustomPostRenderer: (type: string, component: any, id: string) => Promise<ActionResult>;
    initializeProducts: () => Promise<unknown>;
}

type Props = {
    theme: Theme;
    telemetryEnabled: boolean;
    telemetryId?: string;
    iosDownloadLink?: string;
    androidDownloadLink?: string;
    appDownloadLink?: string;
    noAccounts: boolean;
    showTermsOfService: boolean;
    permalinkRedirectTeamName: string;
    isCloud: boolean;
    actions: Actions;
    plugins?: PluginComponent[];
    products: ProductComponent[];
    showLaunchingWorkspace: boolean;
    rhsIsExpanded: boolean;
    rhsIsOpen: boolean;
    shouldShowAppBar: boolean;
    ksuiteBridge: KSuiteBridge;
} & RouteComponentProps

interface State {
    configLoaded?: boolean;
}

export default class Root extends React.PureComponent<Props, State> {
    private mounted: boolean;
    private retryGetToken: number;
    private IKLoginCode: string | undefined;
    private loginCodeInterval: NodeJS.Timer | undefined;
    private tokenCheckInterval: NodeJS.Timer | undefined;
    private headerResizerRef: React.RefObject<HTMLDivElement>;

    // The constructor adds a bunch of event listeners,
    // so we do need this.
    private a11yController: A11yController;

    // Whether the app is running in an iframe.
    private embeddedInIFrame: boolean;

    constructor(props: Props) {
        super(props);
        this.mounted = false;
        this.retryGetToken = 0;
        this.IKLoginCode = undefined;
        this.loginCodeInterval = undefined;
        this.tokenCheckInterval = undefined;

        this.headerResizerRef = React.createRef();

        // Redux
        setUrl(getSiteURL());

        if (!UserAgent.isDesktopApp()) {
            Client4.setAuthHeader = false; // Disable auth header to enable CSRF check
        }

        setCallListeners();

        setSystemEmojis(new Set(EmojiIndicesByAlias.keys()));

        // Force logout of all tabs if one tab is logged out
        window.addEventListener('storage', this.handleLogoutLoginSignal);

        // Prevent drag and drop files from navigating away from the app
        document.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].kind === 'file') {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        document.addEventListener('dragover', (e) => {
            if (!Utils.isTextDroppableEvent(e) && !document.body.classList.contains('focalboard-body')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        this.state = {
            configLoaded: false,
        };

        this.a11yController = new A11yController();

        store.subscribe(() => applyLuxonDefaults(store.getState()));
    }

    onConfigLoaded = () => {
        const config = getConfig(store.getState());
        const telemetryId = this.props.telemetryId;

        const rudderUrl = 'https://pdat.matterlytics.com';
        let rudderKey = '';
        switch (config.ServiceEnvironment) {
        case ServiceEnvironment.PRODUCTION:
            rudderKey = '1aoejPqhgONMI720CsBSRWzzRQ9';
            break;
        case ServiceEnvironment.TEST:
            rudderKey = '1aoeoCDeh7OCHcbW2kseWlwUFyq';
            break;
        case ServiceEnvironment.DEV:
            break;
        }

        if (rudderKey !== '' && this.props.telemetryEnabled) {
            const rudderCfg: {setCookieDomain?: string} = {};
            const siteURL = getConfig(store.getState()).SiteURL;
            if (siteURL !== '') {
                try {
                    rudderCfg.setCookieDomain = new URL(siteURL || '').hostname;
                    // eslint-disable-next-line no-empty
                } catch (_) {}
            }
            rudderAnalytics.load(rudderKey, rudderUrl || '', rudderCfg);

            rudderAnalytics.identify(telemetryId, {}, {
                context: {
                    ip: '0.0.0.0',
                },
                page: {
                    path: '',
                    referrer: '',
                    search: '',
                    title: '',
                    url: '',
                },
                anonymousId: '00000000000000000000000000',
            });

            rudderAnalytics.page('ApplicationLoaded', {
                path: '',
                referrer: '',
                search: ('' as any),
                title: '',
                url: '',
            } as any,
            {
                context: {
                    ip: '0.0.0.0',
                },
                anonymousId: '00000000000000000000000000',
            });

            const utmParams = this.captureUTMParams();
            rudderAnalytics.ready(() => {
                Client4.setTelemetryHandler(new RudderTelemetryHandler());
                if (utmParams) {
                    trackEvent('utm_params', 'utm_params', utmParams);
                }
            });
        }

        Promise.all([
            this.props.actions.initializeProducts(),
            initializePlugins(),
        ]).then(() => {
            if (this.mounted) {
                // supports enzyme tests, set state if and only if
                // the component is still mounted on screen
                this.setState({configLoaded: true});
            }
        });

        this.props.actions.migrateRecentEmojis();
        store.dispatch(loadRecentlyUsedCustomEmojis());

        this.showLandingPageIfNecessary();

        Utils.applyTheme(this.props.theme);
    };

    private showLandingPageIfNecessary = () => {
        // We have nothing to redirect to if we're already on Desktop App
        // Chromebook has no Desktop App to switch to
        if (UserAgent.isDesktopApp() || UserAgent.isChromebook()) {
            return;
        }

        // Nothing to link to if we've removed the Android App download link
        if (UserAgent.isAndroidWeb() && !this.props.androidDownloadLink) {
            return;
        }

        // Nothing to link to if we've removed the iOS App download link
        if (UserAgent.isIosWeb() && !this.props.iosDownloadLink) {
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

    componentDidUpdate(prevProps: Props) {
        if (!deepEqual(prevProps.theme, this.props.theme)) {
            // add body class for webcomponents theming
            if (document.body.className.match(/kchat-.+-theme/)) {
                document.body.className = document.body.className.replace(/kchat-.+-theme/, `kchat-${this.props.theme.ikType}-theme`);
            } else {
                document.body.className += ` kchat-${this.props.theme.ikType}-theme`;
            }

            Utils.applyTheme(this.props.theme);
        }
        if (
            this.props.shouldShowAppBar !== prevProps.shouldShowAppBar ||
            this.props.rhsIsOpen !== prevProps.rhsIsOpen ||
            this.props.rhsIsExpanded !== prevProps.rhsIsExpanded
        ) {
            this.setRootMeta();
        }
    }

    async redirectToOnboardingOrDefaultTeam() {
        const storeState = store.getState();
        const isUserAdmin = isCurrentUserSystemAdmin(storeState);
        if (!isUserAdmin) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }

        const teams = getActiveTeamsList(storeState);

        const onboardingFlowEnabled = getIsOnboardingFlowEnabled(storeState);

        if (teams.length > 0 || !onboardingFlowEnabled) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }

        const firstAdminSetupComplete = await this.props.actions.getFirstAdminSetupComplete();
        if (firstAdminSetupComplete?.data) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }

        const profilesResult = await this.props.actions.getProfiles(0, General.PROFILE_CHUNK_SIZE, {roles: General.SYSTEM_ADMIN_ROLE});
        if (profilesResult.error) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }
        const currentUser = getCurrentUser(store.getState());
        const adminProfiles = profilesResult.data.reduce(
            (acc: Record<string, UserProfile>, curr: UserProfile) => {
                acc[curr.id] = curr;
                return acc;
            },
            {},
        );
        if (checkIsFirstAdmin(currentUser, adminProfiles)) {
            this.props.history.push('/preparing-workspace');
            return;
        }

        GlobalActions.redirectUserToDefaultTeam();
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
        const {data: isMeLoaded} = await this.props.actions.loadConfigAndMe();

        if (isMeLoaded) {
            const currentUser = getCurrentUser(store.getState());
            if (currentUser) {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const {email, id, user_id, username, first_name, last_name} = currentUser;
                console.log('[components/root] set user for sentry', {email, id, username}); // eslint-disable-line no-console
                Sentry.setUser({ip_address: '{{auto}}', email, id, username});

                // @ts-ignore
                window.CONST_USER = {
                    iGlobalUserCode: user_id,
                    sFirstname: first_name,
                    sLastname: last_name,
                    sEmail: email,
                };
            }

            if (this.props.location.pathname === '/') {
                this.redirectToOnboardingOrDefaultTeam();
            }
        }

        this.onConfigLoaded();
    };

    componentDidMount() {
        temporarilySetPageLoadContext(PageLoadContext.PAGE_LOAD);

        if (UserAgent.isDesktopApp()) {
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
    }

    storeLoginCode = (code: string) => {
        console.log('[components/root] store login code'); // eslint-disable-line no-console
        this.IKLoginCode = code;
    };

    tryGetNewToken = async () => {
        const challenge = JSON.parse(localStorage.getItem('challenge') as string);
        const loginCode = this.IKLoginCode;
        console.log('[component/root] try get token count', this.retryGetToken); // eslint-disable-line no-console
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
                newToken = {
                    token: response.access_token,
                    refreshToken: response.refresh_token,
                    expiresAt: (Date.now() / 1000) + response.expires_in, // ignore as its never undefined in 2.0
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

            this.retryGetToken = 0;
            clearInterval(this.loginCodeInterval as NodeJS.Timer);

            // Allow through initial requests anyway to receive new errors.
            this.runMounted();
        } catch (error) {
            console.log('[components/root] post token fail ', error); // eslint-disable-line no-console

            if (this.retryGetToken < MAX_GET_TOKEN_FAILS) {
                console.log('[components/root] will retry token post with fail count: ', this.retryGetToken); // eslint-disable-line no-console
                this.retryGetToken += 1;
                const retryTime = MIN_GET_TOKEN_RETRY_TIME * this.retryGetToken;
                clearInterval(this.loginCodeInterval as NodeJS.Timer);
                this.loginCodeInterval = setInterval(() => this.tryGetNewToken(), retryTime);
            } else {
                console.log('[components/root] max retry count reached, continuing with mount to reach login'); // eslint-disable-line no-console
                clearInterval(this.loginCodeInterval as NodeJS.Timer);
                this.IKLoginCode = undefined;

                Sentry.captureException(new Error('Get token max error count. Redirect to login'));
                this.runMounted();
            }
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

    runMounted = () => {
        this.mounted = true;

        const token = localStorage.getItem('IKToken');
        const tokenExpire = localStorage.getItem('IKTokenExpire');
        const refreshToken = localStorage.getItem('IKRefreshToken');

        // Validate infinite token or setup token keepalive for older tokens
        if (UserAgent.isDesktopApp()) {
            if (isServerVersionGreaterThanOrEqualTo(UserAgent.getDesktopVersion(), '2.1.0')) {
                // TODO: find a way to clean this if into an else below, since its counterintuitive
                // The reset teams will retrigger this func
                if (isDefaultAuthServer() && !token) {
                    getChallengeAndRedirectToLogin(true);
                }

                // Webcomponents oauth v2
                window.WC_TOKEN = token;

                // migration from 2.0
                if (token && (tokenExpire || refreshToken)) {
                    // Prepare migrate to infinite token by clearing all instances of old token
                    clearLocalStorageToken();
                    window.authManager.resetToken();

                    // Need to reset teams before redirecting to login after token is cleared
                    if (isDefaultAuthServer()) {
                        getChallengeAndRedirectToLogin(true);
                    } else {
                        window.postMessage(
                            {
                                type: 'reset-teams',
                                message: {},
                            },
                            window.origin,
                        );
                    }
                }
            } else if (token && refreshToken) {
                // 2.0 and older apps
                // set an interval to run every minute to check if token needs refresh soon
                // for older versions of app.
                this.tokenCheckInterval = setInterval(this.doTokenCheck, /*one minute*/1000 * 60);
            }
        }

        // Binds a handler for unexpected session loss on desktop, web will follow api redirect.
        Client4.bindEmitUserLoggedOutEvent(async (data) => {
            // eslint-disable-next-line no-negated-condition
            if (!UserAgent.isDesktopApp()) {
                window.location.href = data.uri;
            } else {
                const lsToken = localStorage.getItem('IKToken');

                if (lsToken) {
                    // Delete the token if it still exists.
                    clearLocalStorageToken();
                    clearUserCookie();
                    await window.authManager.logout();
                    window.authManager.resetToken();
                }
            }
        });

        const ksuiteBridge = new KSuiteBridge({debug: true}); // eslint-disable-line no-process-env
        storeBridge(ksuiteBridge)(store.dispatch);

        Utils.injectWebcomponentInit();

        this.initiateMeRequests();

        // See figma design on issue https://mattermost.atlassian.net/browse/MM-43649
        this.props.actions.registerCustomPostRenderer('custom_up_notification', OpenPricingModalPost, 'upgrade_post_message_renderer');
        this.props.actions.registerCustomPostRenderer('custom_pl_notification', OpenPluginInstallPost, 'plugin_install_post_message_renderer');

        measurePageLoadTelemetry();
        trackSelectorMetrics();
    };

    componentWillUnmount() {
        this.mounted = false;
        this.retryGetToken = 0;
        this.IKLoginCode = undefined;
        window.removeEventListener('storage', this.handleLogoutLoginSignal);
        if (this.tokenCheckInterval) {
            console.log('[components/root] destroy token interval check'); // eslint-disable-line no-console
            clearInterval(this.tokenCheckInterval);
        }

        if (this.loginCodeInterval) {
            console.log('[components/root] destroy login with code interval'); // eslint-disable-line no-console
            clearInterval(this.loginCodeInterval);
        }
    }

    handleLogoutLoginSignal = (e: StorageEvent) => {
        // when one tab on a browser logs out, it sets __logout__ in localStorage to trigger other tabs to log out
        const isNewLocalStorageEvent = (event: StorageEvent) => event.storageArea === localStorage && event.newValue;

        if (e.key === StoragePrefixes.LOGOUT && isNewLocalStorageEvent(e)) {
            console.log('detected logout from a different tab'); //eslint-disable-line no-console
            GlobalActions.emitUserLoggedOutEvent('/', false, false);
        }
        if (e.key === StoragePrefixes.LOGIN && isNewLocalStorageEvent(e)) {
            const isLoggedIn = getCurrentUser(store.getState());

            // make sure this is not the same tab which sent login signal
            // because another tabs will also send login signal after reloading
            if (isLoggedIn) {
                return;
            }

            // detected login from a different tab
            function reloadOnFocus() {
                location.reload();
            }
            window.addEventListener('focus', reloadOnFocus);
        }
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
        if (!this.state.configLoaded) {
            return <div/>;
        }

        const {ksuiteBridge, location} = this.props;
        ksuiteBridge?.sendMessage({type: NavigateMessageKey, path: location.pathname});

        return (
            <RootProvider>
                <MobileViewWatcher/>
                <Switch>
                    <Route
                        path={'/error'}
                        component={ErrorPage}
                    />
                    <HFRoute
                        path={'/login'}
                        component={Login}
                    />
                    <HFRoute
                        path={'/access_problem'}
                        component={AccessProblem}
                    />
                    {/* <HFTRoute
                        path={'/help'}
                        component={HelpController}
                    /> */}
                    {/* <Route
                        path={'/landing'}
                        component={LinkingLandingPage}
                    /> */}

                    <LoggedInRoute
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
                        {!this.embeddedInIFrame && <TeamSidebar/>}
                        {/* <CloudEffects/>
                        <TeamSidebar/> */}
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
                                    path={'/plug/' + (plugin as any).route}
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
                                theme={this.props.theme}
                                headerRef={this.headerResizerRef}
                                path={`/:team(${TEAM_NAME_PATH_PATTERN})`}
                                component={TeamController}
                            />
                            <RootRedirect/>
                        </Switch>
                        <Pluggable pluggableName='Global'/>
                        <SidebarRight/>
                        <AppBar/>
                        <SidebarRightMenu/>
                    </CompassThemeProvider>
                </Switch>
            </RootProvider>
        );
    }
}
