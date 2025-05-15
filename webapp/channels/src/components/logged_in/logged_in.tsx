// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import type {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {setLastKSuiteSeenCookie} from 'mattermost-redux/utils/team_utils';

import * as GlobalActions from 'actions/global_actions';
import * as WebSocketActions from 'actions/websocket_actions.jsx';
import BrowserStore from 'stores/browser_store';

import LoadingScreen from 'components/loading_screen';

import Constants from 'utils/constants';
import DesktopApp from 'utils/desktop_api';
import {isKeyPressed} from 'utils/keyboard';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getBrowserTimezone} from 'utils/timezone';
import {getDesktopVersion, isAndroid, isDesktopApp, isIos} from 'utils/user_agent';

import WebSocketClient from 'client/web_websocket_client';

// import {doesCookieContainsMMUserId} from 'utils/utils';

declare global {
    interface Window {
        desktop: {
            version?: string | null;
            theme?: object | null;
        };
    }
}

export type Props = {
    currentTeam: Team;
    theme: Theme;
    currentUser?: UserProfile;
    currentChannelId?: string;
    isCurrentChannelManuallyUnread: boolean;
    children?: React.ReactNode;
    mfaRequired: boolean;
    actions: {
        autoUpdateTimezone: (deviceTimezone: string) => void;
        getChannelURLAction: (channelId: string, teamId: string, url: string) => void;
        updateApproximateViewTime: (channelId: string) => void;
        registerInternalKdrivePlugin: () => void;
        setTheme: (theme: Theme) => void;
        updateTeamsOrderForUser: (teamsOrder: string[]) => void;
        joinCall: (channelId: string) => void;
        declineCall: (channelId: string) => void;
        cancelCall: (channelId: string) => void;
        registerInternalAiPlugin: () => void;
    };
    showTermsOfService: boolean;
    location: {
        pathname: string;
        search: string;
    };
}

export default class LoggedIn extends React.PureComponent<Props> {
    private cleanupDesktopListeners?: () => void;

    constructor(props: Props) {
        super(props);

        const root = document.getElementById('root');
        if (root) {
            root.className += ' channel-view';
        }
    }

    private isValidState(): boolean {
        return this.props.currentUser != null;
    }

    public componentDidMount(): void {
        // Initialize websocket
        WebSocketActions.initialize();

        if (!isDesktopApp() || isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.4.0')) {
            this.props.actions.registerInternalKdrivePlugin();
        }
        this.updateTimeZone();
        this.props.actions.registerInternalAiPlugin();

        // Make sure the websockets close and reset version
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // listen for the app visibility state
        window.addEventListener('visibilitychange', this.handleVisibilityChange, false);

        // Listen for focused tab/window state
        window.addEventListener('focus', this.onFocusListener);
        window.addEventListener('blur', this.onBlurListener);
        if (!document.hasFocus()) {
            GlobalActions.emitBrowserFocus(false);
        }

        // Listen for user activity and notifications from the Desktop App (if applicable)
        const offUserActivity = DesktopApp.onUserActivityUpdate(this.updateActiveStatus);
        const offNotificationClicked = DesktopApp.onNotificationClicked(this.clickNotification);
        const offThemeChangedGlobal = DesktopApp.onThemeChangedGlobal(this.changeGlobalTheme);
        const offGetServerTheme = DesktopApp.onGetServerTheme(this.getServerTheme);
        const offUpdateTeamsOrder = DesktopApp.onTeamsOrderUpdated(this.updateTeamsOrder);
        const offSwitchServerSidebar = DesktopApp.onSwitchServerSidebar(this.switchServerSidebar);
        this.cleanupDesktopListeners = () => {
            offUserActivity();
            offNotificationClicked();
            offThemeChangedGlobal();
            offGetServerTheme();
            offUpdateTeamsOrder();
            offSwitchServerSidebar();
        };

        this.setCallListeners();

        // Device tracking setup
        if (isIos()) {
            document.body.classList.add('ios');
        } else if (isAndroid()) {
            document.body.classList.add('android');
        }

        if (!this.props.currentUser) {
            const rootEl = document.getElementById('root');
            if (rootEl) {
                rootEl.setAttribute('class', '');
            }
            GlobalActions.emitUserLoggedOutEvent('/login?redirect_to=' + encodeURIComponent(`${this.props.location.pathname}${this.props.location.search}`), true, false);
        }

        // Prevent backspace from navigating back a page
        window.addEventListener('keydown', this.handleBackSpace);

        if (this.isValidState()) {
            BrowserStore.signalLogin();
            DesktopApp.signalLogin();
        }
    }

    public componentWillUnmount(): void {
        WebSocketActions.close();

        window.removeEventListener('keydown', this.handleBackSpace);

        window.removeEventListener('focus', this.onFocusListener);
        window.removeEventListener('blur', this.onBlurListener);

        this.cleanupDesktopListeners?.();
    }

    public render(): React.ReactNode {
        if (!this.isValidState()) {
            return <LoadingScreen/>;
        }

        return this.props.children;
    }

    private handleVisibilityChange = (): void => {
        if (!document.hidden) {
            this.updateTimeZone();
        }
    };

    private updateTimeZone(): void {
        this.props.actions.autoUpdateTimezone(getBrowserTimezone());
    }

    private onFocusListener(): void {
        GlobalActions.emitBrowserFocus(true);
    }

    private onBlurListener(): void {
        GlobalActions.emitBrowserFocus(false);
    }

    private updateActiveStatus = (userIsActive: boolean, idleTime: number, manual: boolean) => {
        if (!this.props.currentUser) {
            return;
        }

        // update the server with the users current away status
        if (userIsActive === true || userIsActive === false) {
            WebSocketClient.userUpdateActiveStatus(userIsActive, manual);
        }
    };

    private clickNotification = (channelId: string, teamId: string, url: string) => {
        window.focus();

        // navigate to the appropriate channel
        this.props.actions.getChannelURLAction(channelId, teamId, url);
    };

    changeGlobalTheme = (theme?: Theme) => {
        if (theme) {
            this.props.actions.setTheme(theme as Theme);
        }
    };

    getServerTheme = () => {
        const preferredTheme = this.props.theme;
        const currentTeam = this.props.currentTeam;

        window.postMessage(
            {
                type: 'preferred-theme',
                data: {
                    theme: preferredTheme,
                    teamName: currentTeam.display_name,
                },
            },
            window.origin,
        );
    };

    updateTeamsOrder = (teamsOrder: string[]) => {
        if (teamsOrder) {
            this.props.actions.updateTeamsOrderForUser(teamsOrder);
        }
    };

    switchServerSidebar = (serverId: string) => {
        if (serverId) {
            setLastKSuiteSeenCookie(serverId);
        }
    };

    private handleBackSpace = (e: KeyboardEvent): void => {
        const excludedElements = ['input', 'textarea', 'module-reporting-tools-component'];
        const targetElement = e.target as HTMLElement;

        if (!targetElement) {
            return;
        }

        const targetsTagName = targetElement.tagName.toLowerCase();
        const isTargetNotContentEditable = targetElement.getAttribute?.('contenteditable') !== 'true';

        if (
            isKeyPressed(e, Constants.KeyCodes.BACKSPACE) &&
            !(excludedElements.includes(targetsTagName)) &&
            isTargetNotContentEditable
        ) {
            e.preventDefault();
        }
    };

    private setCallListeners() {
        if (isDesktopApp() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.3.0')) {
            window?.callManager?.onCallJoined?.((_: any, {channelId, channelID}) => this.props.actions.joinCall(channelID || channelId));
            window?.callManager?.onCallDeclined?.((_: any, {channelId, channelID}) => this.props.actions.declineCall(channelID || channelId));
            window?.callManager?.onCallCancel?.((_: any, {channelId}) => this.props.actions.cancelCall(channelId));

            // window?.callManager?.onCallEnded?.((_: any, {channelID}) => this.props.actions.cancelCall(channelID));
        }
    }

    private handleBeforeUnload = (): void => {
        // remove the event listener to prevent getting stuck in a loop
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        if (this.props.currentChannelId && !this.props.isCurrentChannelManuallyUnread) {
            this.props.actions.updateApproximateViewTime(this.props.currentChannelId);
        }
        WebSocketActions.close();
    };
}
