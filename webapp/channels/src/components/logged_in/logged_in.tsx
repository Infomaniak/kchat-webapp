// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import semver from 'semver';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import * as GlobalActions from 'actions/global_actions';
import {updateTeamsOrderForUser} from 'actions/team_actions';
import * as WebSocketActions from 'actions/websocket_actions.jsx';
import BrowserStore from 'stores/browser_store';
import store from 'stores/redux_store';

import LoadingScreen from 'components/loading_screen';

import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getBrowserTimezone} from 'utils/timezone';
import * as UserAgent from 'utils/user_agent';

import WebSocketClient from 'client/web_websocket_client';

const BACKSPACE_CHAR = 8;

const dispatch = store.dispatch;

declare global {
    interface Window {
        desktop: {
            version?: string | null;
            theme?: object | null;
        };
    }
}

export type Props = {
    currentUser?: UserProfile;
    currentChannelId?: string;
    children?: React.ReactNode;
    enableTimezone: boolean;
    actions: {
        autoUpdateTimezone: (deviceTimezone: string) => void;
        getChannelURLAction: (channel: Channel, teamId: string, url: string) => void;
        viewChannel: (channelId: string, prevChannelId?: string) => void;
        registerInternalKdrivePlugin: () => void;
    };
    location: {
        pathname: string;
        search: string;
    };
}

type DesktopMessage = {
    origin: string;
    data: {
        type: string;
        message: {
            version: string;
            theme: object | null;
            userIsActive: boolean;
            manual: boolean;
            channel: Channel;
            teamId: string;
            url: string;
            teamsOrder?: string[];
        };
    };
}

const dispatch = store.dispatch;
const getState = store.getState;

export default class LoggedIn extends React.PureComponent<Props> {
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

        if (this.props.enableTimezone && this.props.currentUser) {
            this.props.actions.autoUpdateTimezone(getBrowserTimezone());
        }

        if (!UserAgent.isDesktopApp() || isServerVersionGreaterThanOrEqualTo(UserAgent.getDesktopVersion(), '2.4.0')) {
            this.props.actions.registerInternalKdrivePlugin();
        }

        // Make sure the websockets close and reset version
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // Listen for focused tab/window state
        window.addEventListener('focus', this.onFocusListener);
        window.addEventListener('blur', this.onBlurListener);
        if (!document.hasFocus()) {
            GlobalActions.emitBrowserFocus(false);
        }

        // Listen for messages from the desktop app
        window.addEventListener('message', this.onDesktopMessageListener);

        // Tell the desktop app the webapp is ready
        window.postMessage(
            {
                type: 'webapp-ready',
            },
            window.location.origin,
        );

        // Device tracking setup
        if (UserAgent.isIos()) {
            document.body.classList.add('ios');
        } else if (UserAgent.isAndroid()) {
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
        }
    }

    public componentWillUnmount(): void {
        WebSocketActions.close();

        window.removeEventListener('keydown', this.handleBackSpace);

        window.removeEventListener('focus', this.onFocusListener);
        window.removeEventListener('blur', this.onBlurListener);
        window.removeEventListener('message', this.onDesktopMessageListener);
    }

    public render(): React.ReactNode {
        if (!this.isValidState()) {
            return <LoadingScreen/>;
        }

        return this.props.children;
    }

    private onFocusListener(): void {
        GlobalActions.emitBrowserFocus(true);
    }

    private onBlurListener(): void {
        GlobalActions.emitBrowserFocus(false);
    }

    // listen for messages from the desktop app
    private onDesktopMessageListener = (desktopMessage: DesktopMessage) => {
        if (!this.props.currentUser) {
            return;
        }
        if (desktopMessage.origin !== window.location.origin) {
            return;
        }

        switch (desktopMessage.data.type) {
        case 'register-desktop': {
            const {version, theme} = desktopMessage.data.message;
            if (!window.desktop) {
                window.desktop = {};
            }
            window.desktop.version = semver.valid(semver.coerce(version));
            window.desktop.theme = theme;
            dispatch(setTheme(window.desktop.theme as Theme));
            break;
        }
        case 'user-activity-update': {
            const {userIsActive, manual} = desktopMessage.data.message;

            if (userIsActive === true || userIsActive === false) {
                WebSocketClient.userUpdateActiveStatus(userIsActive, manual);
            }
            break;
        }
        case 'teams-order-updated': {
            const {teamsOrder} = desktopMessage.data.message;
            if (teamsOrder) {
                updateTeamsOrderForUser(teamsOrder)(dispatch, getState);
            }
            break;
        }
        case 'get-server-theme': {
            const preferredTheme = getTheme(store.getState());
            const currentTeam = getCurrentTeam(store.getState());

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
            break;
        }
        case 'notification-clicked': {
            const {channel, teamId, url} = desktopMessage.data.message;
            window.focus();

            // navigate to the appropriate channel
            this.props.actions.getChannelURLAction(channel, teamId, url);
            break;
        }
        case 'theme-changed-global': {
            dispatch(setTheme((desktopMessage.data as any).theme as Theme));
            break;
        }
        }
    };

    private handleBackSpace = (e: KeyboardEvent): void => {
        const excludedElements = ['input', 'textarea', 'module-reporting-tools-component'];

        if (e.which === BACKSPACE_CHAR && !(excludedElements.includes((e.target as HTMLElement).tagName.toLowerCase()))) {
            e.preventDefault();
        }
    };

    private handleBeforeUnload = (): void => {
        // remove the event listener to prevent getting stuck in a loop
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        this.props.actions.viewChannel('', this.props.currentChannelId || '');
        WebSocketActions.close();
    };
}
