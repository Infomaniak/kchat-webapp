// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import semver from 'semver';

import type {DesktopAPI} from '@mattermost/desktop-api';

import type {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {setTheme} from 'actions/views/theme';
import store from 'stores/redux_store';

import {isDesktopApp} from 'utils/user_agent';
import * as UserAgent from 'utils/user_agent';

import {isServerVersionGreaterThanOrEqualTo} from './server_version';

declare global {
    interface Window {
        desktopAPI?: Partial<DesktopAPI & {
            openKmeetCallWindow: (params: object) => void;
            closeRingCallWindow: () => void;
            isRingCallWindowOpen: () => Promise<boolean>;
            openCallDialing: (callInfo: object) => boolean;
        }>;
        callManager?: Partial<{
            onCallJoined: (callback: (_: any, props: {channelId: string; channelID?: string}) => void) => void;
            onCallDeclined: (callback: (_: any, props: {channelId: string; channelID?: string}) => void) => void;
            onCallEnded: (callback: (_: any, props: {channelID: string}) => void) => void;
            onCallCancel: (callback: (_: any, props: {channelId: string}) => void) => void;
        }>;
    }
}

const dispatch = store.dispatch;

export class DesktopAppAPI {
    private name?: string;
    private version?: string | null;
    private prereleaseVersion?: string;
    private dev?: boolean;

    /**
     * @deprecated
     */
    private postMessageListeners?: Map<string, Set<(message: unknown, rest: unknown) => void>>;

    constructor() {
        // Check the user agent string first
        if (!isDesktopApp()) {
            return;
        }

        this.getDesktopAppInfo().then(({name, version, ...rest}) => {
            this.name = name;
            this.version = semver.valid(semver.coerce(version));
            this.prereleaseVersion = version?.split('-')?.[1];

            // Legacy Desktop App version, used by some plugins
            if (!window.desktop) {
                window.desktop = {};
            }

            window.desktop.version = semver.valid(semver.coerce(version));
            if (isServerVersionGreaterThanOrEqualTo(UserAgent.getDesktopVersion(), '3.1.0') && 'theme' in rest) {
                // May be undefined as declared in src/common/Validator.ts:152 in the desktop app
                if (!rest.theme) {
                    return;
                }
                window.desktop.theme = rest.theme as Theme;
                dispatch(setTheme(window.desktop.theme as Theme));
            }
        });
        window.desktopAPI?.isDev?.().then((isDev) => {
            this.dev = isDev;
        });

        // Legacy code - to be removed
        this.postMessageListeners = new Map();
        window.addEventListener('message', this.postMessageListener);
        window.addEventListener('beforeunload', () => {
            window.removeEventListener('message', this.postMessageListener);
        });
    }

    /*******************************************************
     * Getters/setters for Desktop App specific information
     *******************************************************/

    getAppName = () => {
        return this.name;
    };

    getAppVersion = () => {
        return this.version;
    };

    getPrereleaseVersion = () => {
        return this.prereleaseVersion;
    };

    isDev = () => {
        return this.dev;
    };

    private getDesktopAppInfo = () => {
        // if (window.desktopAPI?.getAppInfo) {
        //     return window.desktopAPI.getAppInfo();
        // }

        return this.invokeWithMessaging<void, {name: string; version: string; theme?: object}>(
            'webapp-ready',
            undefined,
            'register-desktop',
        );
    };

    /**********************
     * Exposed API methods
     **********************/

    /**
     * Invokes
     */

    getBrowserHistoryStatus = async () => {
        if (window.desktopAPI?.requestBrowserHistoryStatus) {
            return window.desktopAPI.requestBrowserHistoryStatus();
        }

        const {enableBack, enableForward} = await this.invokeWithMessaging<void, {enableBack: boolean; enableForward: boolean}>(
            'history-button',
            undefined,
            'history-button-return',
        );

        return {
            canGoBack: enableBack,
            canGoForward: enableForward,
        };
    };

    /**
     * Listeners
     */

    onUserActivityUpdate = (listener: (userIsActive: boolean, idleTime: number, isSystemEvent: boolean) => void) => {
        if (window.desktopAPI?.onUserActivityUpdate) {
            return window.desktopAPI.onUserActivityUpdate(listener);
        }

        const legacyListener = ({userIsActive, manual}: {userIsActive: boolean; manual: boolean}) => listener(userIsActive, 0, manual);
        this.addPostMessageListener('user-activity-update', legacyListener);

        return () => this.removePostMessageListener('user-activity-update', legacyListener);
    };

    onNotificationClicked = (listener: (channelId: string, teamId: string, url: string) => void) => {
        if (window.desktopAPI?.onNotificationClicked) {
            return window.desktopAPI.onNotificationClicked(listener);
        }

        const legacyListener = ({channel, teamId, url}: {channel: {id: string}; teamId: string; url: string}) => listener(channel.id, teamId, url);
        this.addPostMessageListener('notification-clicked', legacyListener);

        return () => this.removePostMessageListener('notification-clicked', legacyListener);
    };

    onBrowserHistoryPush = (listener: (pathName: string) => void) => {
        if (window.desktopAPI?.onBrowserHistoryPush) {
            return window.desktopAPI.onBrowserHistoryPush(listener);
        }

        const legacyListener = ({pathName}: {pathName: string}) => listener(pathName);
        this.addPostMessageListener('browser-history-push-return', legacyListener);

        return () => this.removePostMessageListener('browser-history-push-return', legacyListener);
    };

    onBrowserHistoryStatusUpdated = (listener: (enableBack: boolean, enableForward: boolean) => void) => {
        if (window.desktopAPI?.onBrowserHistoryStatusUpdated) {
            return window.desktopAPI.onBrowserHistoryStatusUpdated(listener);
        }

        const legacyListener = ({enableBack, enableForward}: {enableBack: boolean; enableForward: boolean}) => listener(enableBack, enableForward);
        this.addPostMessageListener('history-button-return', legacyListener);

        return () => this.removePostMessageListener('history-button-return', legacyListener);
    };

    onThemeChangedGlobal = (listener: (theme: Theme) => void) => {
        const legacyListener = (_: any, {theme}: {theme: Theme}) => listener(theme);
        this.addPostMessageListener('theme-changed-global', legacyListener);

        return () => this.removePostMessageListener('theme-changed-global', legacyListener);
    };

    onGetServerTheme = (listener: () => void) => {
        const legacyListener = () => listener();
        this.addPostMessageListener('get-server-theme', legacyListener);

        return () => this.removePostMessageListener('get-server-theme', legacyListener);
    };

    onTeamsOrderUpdated = (listener: (teamsOrder: string[]) => void) => {
        const legacyListener = ({teamsOrder}: {teamsOrder: string[]}) => listener(teamsOrder);
        this.addPostMessageListener('teams-order-updated', legacyListener);

        return () => this.removePostMessageListener('teams-order-updated', legacyListener);
    };

    onSwitchServerSidebar = (listener: (serverId: string) => void) => {
        const legacyListener = ({serverId}: {serverId: string}) => listener(serverId);
        this.addPostMessageListener('switch-server-sidebar', legacyListener);

        return () => this.removePostMessageListener('switch-server-sidebar', legacyListener);
    };

    onReceiveMetrics = (listener: (metricsMap: Map<string, {cpu?: number; memory?: number}>) => void) => {
        return window.desktopAPI?.onSendMetrics?.(listener);
    };

    /**
     * One-ways
     */

    dispatchNotification = async (
        title: string,
        body: string,
        channelId: string,
        teamId: string,
        silent: boolean,
        soundName: string,
        url: string,
    ) => {
        if (window.desktopAPI?.sendNotification) {
            const result = await window.desktopAPI.sendNotification(title, body, channelId, teamId, url, silent, soundName);
            return result ?? {status: 'unsupported', reason: 'desktop_app_unsupported'};
        }

        // get the desktop app to trigger the notification
        window.postMessage(
            {
                type: 'dispatch-notification',
                message: {
                    title,
                    body,
                    channel: {id: channelId},
                    teamId,
                    silent,
                    data: {soundName},
                    url,
                },
            },
            window.location.origin,
        );
        return {status: 'unsupported', reason: 'desktop_app_unsupported'};
    };

    doBrowserHistoryPush = (path: string) => {
        if (window.desktopAPI?.sendBrowserHistoryPush) {
            window.desktopAPI.sendBrowserHistoryPush(path);
            return;
        }

        window.postMessage(
            {
                type: 'browser-history-push',
                message: {path},
            },
            window.location.origin,
        );
    };

    updateUnreadsAndMentions = (isUnread: boolean, mentionCount: number) =>
        window.desktopAPI?.setUnreadsAndMentions && window.desktopAPI.setUnreadsAndMentions(isUnread, mentionCount);
    setSessionExpired = (expired: boolean) => window.desktopAPI?.setSessionExpired && window.desktopAPI.setSessionExpired(expired);
    signalLogin = () => window.desktopAPI?.onLogin?.();
    signalLogout = () => window.desktopAPI?.onLogout?.();
    reactAppInitialized = () => window.desktopAPI?.reactAppInitialized?.();

    /*********************************************************************
     * Helper functions for legacy code
     * Remove all of this once we have no use for message passing anymore
     *********************************************************************/

    /**
     * @deprecated
     */
    private postMessageListener = ({origin, data: {type, message, ...rest}}: {origin: string; data: {type: string; message: unknown}}) => {
        if (origin !== window.location.origin) {
            return;
        }

        const listeners = this.postMessageListeners?.get(type);
        if (!listeners) {
            return;
        }

        listeners.forEach((listener) => {
            listener(message, rest);
        });
    };

    /**
     * @deprecated
     */
    private addPostMessageListener = (channel: string, listener: (message: any, rest: any) => void) => {
        if (this.postMessageListeners?.has(channel)) {
            this.postMessageListeners.set(channel, this.postMessageListeners.get(channel)!.add(listener));
        } else {
            this.postMessageListeners?.set(channel, new Set([listener]));
        }
    };

    /**
     * @deprecated
     */
    private removePostMessageListener = (channel: string, listener: (message: any, rest: any) => void) => {
        const set = this.postMessageListeners?.get(channel);
        set?.delete(listener);
        if (set?.size) {
            this.postMessageListeners?.set(channel, set);
        } else {
            this.postMessageListeners?.delete(channel);
        }
    };

    /**
     * @deprecated
     */
    private invokeWithMessaging = <T, T2>(
        sendChannel: string,
        sendData?: T,
        receiveChannel?: string,
    ) => {
        return new Promise<T2>((resolve) => {
            /* create and register a temporary listener if necessary */
            const response = ({origin, data: {type, message}}: {origin: string; data: {type: string; message: T2}}) => {
                /* ignore messages from other frames */
                if (origin !== window.location.origin) {
                    return;
                }

                /* ignore messages from other channels */
                if (type !== (receiveChannel ?? sendChannel)) {
                    return;
                }

                /* clean up listener and resolve */
                window.removeEventListener('message', response);
                resolve(message);
            };

            window.addEventListener('message', response);
            window.postMessage(
                {type: sendChannel, message: sendData},
                window.location.origin,
            );
        });
    };
}

const DesktopApp = new DesktopAppAPI();
export default DesktopApp;
