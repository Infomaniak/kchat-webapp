// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Sentry from '@sentry/react';
import classNames from 'classnames';
import deepEqual from 'fast-deep-equal';
import throttle from 'lodash/throttle';
import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import type {RouteComponentProps} from 'react-router-dom';

import 'plugins/export.js';
import type {UserProfile} from '@mattermost/types/users';

import {setSystemEmojis} from 'mattermost-redux/actions/emojis';
import {setUrl} from 'mattermost-redux/actions/general';
import {Client4} from 'mattermost-redux/client';
import {rudderAnalytics, RudderTelemetryHandler} from 'mattermost-redux/client/rudder';
import {General} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import type {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, isCurrentUserSystemAdmin, checkIsFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import type {ActionResult} from 'mattermost-redux/types/actions';

import {setCallListeners} from 'actions/calls';
import {loadRecentlyUsedCustomEmojis} from 'actions/emoji_actions';
import * as GlobalActions from 'actions/global_actions';
import {measurePageLoadTelemetry, trackEvent, trackSelectorMetrics} from 'actions/telemetry_actions.jsx';
import {clearUserCookie} from 'actions/views/cookie';
import {close, initialize} from 'actions/websocket_actions';
import LocalStorageStore from 'stores/local_storage_store';
import store from 'stores/redux_store';

import AccessProblem from 'components/access_problem';
import AnnouncementBarController from 'components/announcement_bar';
import AppBar from 'components/app_bar/app_bar';
import {makeAsyncComponent} from 'components/async_load';
import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';
import GlobalHeader from 'components/global_header/global_header';
import {HFRoute} from 'components/header_footer_route/header_footer_route';
import {HFTRoute} from 'components/header_footer_template_route';
import ModalController from 'components/modal_controller';
import LaunchingWorkspace, {LAUNCHING_WORKSPACE_FULLSCREEN_Z_INDEX} from 'components/preparing_workspace/launching_workspace';
import {Animations} from 'components/preparing_workspace/steps';
import SidebarRight from 'components/sidebar_right';
import SidebarRightMenu from 'components/sidebar_right_menu';
import SystemNotice from 'components/system_notice';
import TeamSidebar from 'components/team_sidebar';
import WelcomePostRenderer from 'components/welcome_post_renderer';

import webSocketClient from 'client/web_websocket_client';
import {initializePlugins} from 'plugins';
import Pluggable from 'plugins/pluggable';
import A11yController from 'utils/a11y_controller';
import Constants, {StoragePrefixes, WindowSizes} from 'utils/constants';
import {IKConstants} from 'utils/constants-ik';
import {EmojiIndicesByAlias} from 'utils/emoji';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getSiteURL} from 'utils/url';
import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';
import * as Utils from 'utils/utils';

import type {ProductComponent, PluginComponent} from 'types/store/plugins';

import {applyLuxonDefaults} from './effects';
import RootProvider from './root_provider';
import RootRedirect from './root_redirect';

import {checkIKTokenExpiresSoon, checkIKTokenIsExpired, clearLocalStorageToken, getChallengeAndRedirectToLogin, isDefaultAuthServer, refreshIKToken, storeTokenResponse} from '../login/utils';

const LazyErrorPage = Utils.lazyWithRetries(() => import('components/error_page'));
const LazyLogin = Utils.lazyWithRetries(() => import('components/login/login'));
const LazyLoggedIn = Utils.lazyWithRetries(() => import('components/logged_in'));
const LazyHelpController = Utils.lazyWithRetries(() => import('components/help/help_controller'));

// const LazyLinkingLandingPage = Utils.lazyWithRetries(() => import('components/linking_landing_page'));
const LazyPreparingWorkspace = Utils.lazyWithRetries(() => import('components/preparing_workspace'));
const LazyTeamController = Utils.lazyWithRetries(() => import('components/team_controller'));
const LazyOnBoardingTaskList = Utils.lazyWithRetries(() => import('components/onboarding_tasklist'));

const ErrorPage = makeAsyncComponent('ErrorPage', LazyErrorPage);
const Login = makeAsyncComponent('LoginController', LazyLogin);
const LoggedIn = makeAsyncComponent('LoggedIn', LazyLoggedIn);
const HelpController = makeAsyncComponent('HelpController', LazyHelpController);

// const LinkingLandingPage = makeAsyncComponent('LinkingLandingPage', LazyLinkingLandingPage);
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

type LoggedInRouteProps<T> = {
    component: React.ComponentType<T>;
    path: string;
    theme?: Theme; // the routes that send the theme are the ones that will actually need to show the onboarding tasklist
};
function LoggedInRoute<T>(props: LoggedInRouteProps<T>) {
    const {component: Component, theme, ...rest} = props;
    return (
        <Route
            {...rest}
            render={(routeProps: RouteComponentProps) => (
                <LoggedIn {...routeProps}>
                    {theme && <CompassThemeProvider theme={theme}>
                        <OnBoardingTaskList/>
                    </CompassThemeProvider>}
                    <Component {...(routeProps as unknown as T)}/>
                </LoggedIn>
            )}
        />
    );
}

const noop = () => {};

export type Actions = {
    emitBrowserWindowResized: (size?: string) => void;
    getFirstAdminSetupComplete: () => Promise<ActionResult>;
    getProfiles: (page?: number, pageSize?: number, options?: Record<string, any>) => Promise<ActionResult>;
    migrateRecentEmojis: () => void;
    loadConfigAndMe: () => Promise<{data: boolean}>;
    registerCustomPostRenderer: (type: string, component: any, id: string) => Promise<ActionResult>;
    initializeProducts: () => Promise<void[]>;
}

type Props = {
    theme: Theme;
    telemetryEnabled: boolean;
    telemetryId?: string;
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
} & RouteComponentProps

interface State {
    configLoaded?: boolean;
}

export default class Root extends React.PureComponent<Props, State> {
    private desktopMediaQuery: MediaQueryList;
    private smallDesktopMediaQuery: MediaQueryList;
    private tabletMediaQuery: MediaQueryList;
    private mobileMediaQuery: MediaQueryList;
    private mounted: boolean;
    private retryGetToken: number;
    private IKLoginCode: string | undefined;
    private loginCodeInterval: NodeJS.Timer | undefined;
    private tokenCheckInterval: NodeJS.Timer | undefined;

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

        // Redux
        setUrl(getSiteURL());

        if (!isDesktopApp()) {
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

        // set initial window size state
        this.desktopMediaQuery = window.matchMedia(`(min-width: ${Constants.DESKTOP_SCREEN_WIDTH + 1}px)`);
        this.smallDesktopMediaQuery = window.matchMedia(`(min-width: ${Constants.TABLET_SCREEN_WIDTH + 1}px) and (max-width: ${Constants.DESKTOP_SCREEN_WIDTH}px)`);
        this.tabletMediaQuery = window.matchMedia(`(min-width: ${Constants.MOBILE_SCREEN_WIDTH + 1}px) and (max-width: ${Constants.TABLET_SCREEN_WIDTH}px)`);
        this.mobileMediaQuery = window.matchMedia(`(max-width: ${Constants.MOBILE_SCREEN_WIDTH}px)`);

        this.updateWindowSize();

        store.subscribe(() => applyLuxonDefaults(store.getState()));

        this.embeddedInIFrame = window.self !== window.top;
    }

    onConfigLoaded = () => {
        const telemetryId = this.props.telemetryId;

        let rudderKey: string | null | undefined = Constants.TELEMETRY_RUDDER_KEY;
        let rudderUrl: string | null | undefined = Constants.TELEMETRY_RUDDER_DATAPLANE_URL;

        if (rudderKey.startsWith('placeholder') && rudderUrl.startsWith('placeholder')) {
            rudderKey = process.env.RUDDER_KEY; //eslint-disable-line no-process-env
            rudderUrl = process.env.RUDDER_DATAPLANE_URL; //eslint-disable-line no-process-env
        }

        if (rudderKey != null && rudderKey !== '' && this.props.telemetryEnabled) {
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
        loadRecentlyUsedCustomEmojis()(store.dispatch, store.getState);

        // const iosDownloadLink = getConfig(store.getState()).IosAppDownloadLink;
        // const androidDownloadLink = getConfig(store.getState()).AndroidAppDownloadLink;
        // const desktopAppDownloadLink = getConfig(store.getState()).AppDownloadLink;

        // const toResetPasswordScreen = this.props.location.pathname === '/reset_password_complete';

        // redirect to the mobile landing page if the user hasn't seen it before
        // let landing;
        // if (UserAgent.isAndroidWeb()) {
        //     landing = androidDownloadLink;
        // } else if (UserAgent.isIosWeb()) {
        //     landing = iosDownloadLink;
        // } else {
        //     landing = desktopAppDownloadLink;
        // }

        // if (landing && !this.props.isCloud && !BrowserStore.hasSeenLandingPage() && !toResetPasswordScreen && !this.props.location.pathname.includes('/landing') && !window.location.hostname?.endsWith('.test.mattermost.com') && !UserAgent.isDesktopApp() && !UserAgent.isChromebook()) {
        //     this.props.history.push('/landing#' + this.props.location.pathname + this.props.location.search);
        //     BrowserStore.setLandingPageSeen(true);
        // }

        Utils.applyTheme(this.props.theme);
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

        const useCaseOnboarding = getUseCaseOnboarding(storeState);
        if (!useCaseOnboarding) {
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
        if (isDesktopApp()) {
            if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.1.0')) {
                // TODO: find a way to clean this if into an else below, since its counterintuitive
                // The reset teams will retrigger this func
                if (isDefaultAuthServer() && !token) {
                    getChallengeAndRedirectToLogin(true);
                }

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
            if (!isDesktopApp()) {
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

        this.initiateMeRequests();

        // See figma design on issue https://mattermost.atlassian.net/browse/MM-43649
        // this.props.actions.registerCustomPostRenderer('custom_up_notification', OpenPricingModalPost, 'upgrade_post_message_renderer');
        // this.props.actions.registerCustomPostRenderer('custom_pl_notification', OpenPluginInstallPost, 'plugin_install_post_message_renderer');
        this.props.actions.registerCustomPostRenderer('system_welcome_post', WelcomePostRenderer, 'welcome_post_renderer');

        if (this.desktopMediaQuery.addEventListener) {
            this.desktopMediaQuery.addEventListener('change', this.handleMediaQueryChangeEvent);
            this.smallDesktopMediaQuery.addEventListener('change', this.handleMediaQueryChangeEvent);
            this.tabletMediaQuery.addEventListener('change', this.handleMediaQueryChangeEvent);
            this.mobileMediaQuery.addEventListener('change', this.handleMediaQueryChangeEvent);
        } else if (this.desktopMediaQuery.addListener) {
            this.desktopMediaQuery.addListener(this.handleMediaQueryChangeEvent);
            this.smallDesktopMediaQuery.addListener(this.handleMediaQueryChangeEvent);
            this.tabletMediaQuery.addListener(this.handleMediaQueryChangeEvent);
            this.mobileMediaQuery.addListener(this.handleMediaQueryChangeEvent);
        } else {
            window.addEventListener('resize', this.handleWindowResizeEvent);
        }

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

        if (this.desktopMediaQuery.removeEventListener) {
            this.desktopMediaQuery.removeEventListener('change', this.handleMediaQueryChangeEvent);
            this.smallDesktopMediaQuery.removeEventListener('change', this.handleMediaQueryChangeEvent);
            this.tabletMediaQuery.removeEventListener('change', this.handleMediaQueryChangeEvent);
            this.mobileMediaQuery.removeEventListener('change', this.handleMediaQueryChangeEvent);
        } else if (this.desktopMediaQuery.removeListener) {
            this.desktopMediaQuery.removeListener(this.handleMediaQueryChangeEvent);
            this.smallDesktopMediaQuery.removeListener(this.handleMediaQueryChangeEvent);
            this.tabletMediaQuery.removeListener(this.handleMediaQueryChangeEvent);
            this.mobileMediaQuery.removeListener(this.handleMediaQueryChangeEvent);
        } else {
            window.removeEventListener('resize', this.handleWindowResizeEvent);
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

    handleWindowResizeEvent = throttle(() => {
        this.props.actions.emitBrowserWindowResized();
    }, 100);

    handleMediaQueryChangeEvent = (e: MediaQueryListEvent) => {
        if (e.matches) {
            this.updateWindowSize();
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

    updateWindowSize = () => {
        switch (true) {
        case this.desktopMediaQuery.matches:
            this.props.actions.emitBrowserWindowResized(WindowSizes.DESKTOP_VIEW);
            break;
        case this.smallDesktopMediaQuery.matches:
            this.props.actions.emitBrowserWindowResized(WindowSizes.SMALL_DESKTOP_VIEW);
            break;
        case this.tabletMediaQuery.matches:
            this.props.actions.emitBrowserWindowResized(WindowSizes.TABLET_VIEW);
            break;
        case this.mobileMediaQuery.matches:
            this.props.actions.emitBrowserWindowResized(WindowSizes.MOBILE_VIEW);
            break;
        }
    };

    render() {
        if (!this.state.configLoaded) {
            return <div/>;
        }

        return (
            <RootProvider>
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
                    <HFTRoute
                        path={'/help'}
                        component={HelpController}
                    />
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
                        <ModalController/>
                        <AnnouncementBarController/>
                        <SystemNotice/>
                        <GlobalHeader/>
                        {!this.embeddedInIFrame && <TeamSidebar/>}
                        <Switch>
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
                                path={'/:team'}
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
