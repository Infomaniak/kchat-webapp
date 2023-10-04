// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import Pusher, {Channel} from 'pusher-js';

// import * as Sentry from '@sentry/react';

const MAX_WEBSOCKET_FAILS = 7;
const MIN_WEBSOCKET_RETRY_TIME = 3000; // 3 sec
const MAX_WEBSOCKET_RETRY_TIME = 300000; // 5 mins
const JITTER_RANGE = 2000; // 2 sec

// TODO: Fix error import
// eslint-disable-next-line no-warning-comments
// TODO update isDesktopApp() with callback
function isDesktopApp(): boolean {
    return window.navigator.userAgent.indexOf('Mattermost') !== -1 && window.navigator.userAgent.indexOf('Electron') !== -1;
}

export type MessageListener = (msg: WebSocketMessage) => void;
export type FirstConnectListener = (socketId?: string) => void;
export type ReconnectListener = (socketId?: string) => void;
export type MissedMessageListener = () => void;
export type ErrorListener = (event: Event) => void;
export type CloseListener = (connectFailCount: number) => void;

export default class WebSocketClient {
    private conn: Pusher | null;
    private teamChannel: Channel | null;
    private userChannel: Channel | null;
    private userTeamChannel: Channel | null;
    private presenceChannel: Channel | null;
    private connectionUrl: string | null;
    private socketId: string | null;
    private currentPresence: string;
    private currentUser: number | null;
    private currentTeamUser: string;
    private currentTeam: string;

    // responseSequence is the number to track a response sent
    // via the websocket. A response will always have the same sequence number
    // as the request.
    private responseSequence: number;

    // serverSequence is the incrementing sequence number from the
    // server-sent event stream.
    private serverSequence: number;
    private connectFailCount: number;
    private errorCount: number;
    private responseCallbacks: {[x: number]: ((msg: any) => void)};

    /**
     * @deprecated Use messageListeners instead
     */
    private eventCallback: MessageListener | null = null;

    /**
     * @deprecated Use firstConnectListeners instead
     */
    private firstConnectCallback: FirstConnectListener | null = null;

    /**
     * @deprecated Use reconnectListeners instead
     */
    private reconnectCallback: ReconnectListener | null = null;

    /**
     * @deprecated Use missedMessageListeners instead
     */
    private missedEventCallback: MissedMessageListener | null = null;

    /**
     * @deprecated Use errorListeners instead
     */
    private errorCallback: ErrorListener | null = null;

    /**
     * @deprecated Use closeListeners instead
     */
    private closeCallback: CloseListener | null = null;

    private messageListeners = new Set<MessageListener>();
    private firstConnectListeners = new Set<FirstConnectListener>();
    private reconnectListeners = new Set<ReconnectListener>();
    private missedMessageListeners = new Set<MissedMessageListener>();
    private errorListeners = new Set<ErrorListener>();
    private closeListeners = new Set<CloseListener>();

    private connectionId: string | null;

    constructor() {
        this.conn = null;
        this.teamChannel = null;
        this.userChannel = null;
        this.userTeamChannel = null;
        this.presenceChannel = null;
        this.connectionUrl = null;
        this.responseSequence = 1;
        this.serverSequence = 0;
        this.connectFailCount = 0;
        this.errorCount = 0;
        this.responseCallbacks = {};
        this.connectionId = '';
        this.socketId = null;
        this.currentPresence = '';
        this.currentUser = null;
        this.currentTeamUser = '';
        this.currentTeam = '';
    }

    unbindPusherEvents() {
        this.conn?.connection.unbind('state_change');
        this.conn?.connection.unbind('error');
        this.conn?.connection.unbind('connected');
    }

    unbindGlobalsAndReset() {
        this.teamChannel?.unbind_global();
        this.userChannel?.unbind_global();
        this.userTeamChannel?.unbind_global();
        this.presenceChannel?.unbind_global();
        this.teamChannel = null;
        this.userChannel = null;
        this.userTeamChannel = null;
        this.presenceChannel = null;
    }

    // on connect, only send auth cookie and blank state.
    // on hello, get the connectionID and store it.
    // on reconnect, send cookie, connectionID, sequence number.
    initialize(
        connectionUrl = this.connectionUrl,
        userId?: number,
        userTeamId?: string,
        teamId?: string,
        authToken?: string,
        presenceChannelId?: string,
    ) {
        let currentUserId: any;
        let currentUserTeamId: any;
        let currentPresenceChannelId: string | undefined;

        // Store this for onmessage reconnect
        if (userId) {
            currentUserId = userId;
        }

        if (userTeamId) {
            currentUserTeamId = userTeamId;
        }

        if (presenceChannelId) {
            currentPresenceChannelId = presenceChannelId;
        }

        if (this.conn) {
            return;
        }

        if (connectionUrl == null) {
            console.log('websocket must have connection url'); //eslint-disable-line no-console
            return;
        }

        if (this.connectFailCount === 0) {
            console.log('websocket connecting to ' + connectionUrl); //eslint-disable-line no-console
        }

        // Add connection id, and last_sequence_number to the query param.
        // We cannot use a cookie because it will bleed across tabs.
        // We cannot also send it as part of the auth_challenge, because the session cookie is already sent with the request.

        if (isDesktopApp()) {
            this.conn = new Pusher('kchat-key', {
                wsHost: connectionUrl,
                httpHost: connectionUrl,
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                },
                enabledTransports: ['ws', 'wss'],
                disabledTransports: ['xhr_streaming', 'xhr_polling', 'sockjs'],
                activityTimeout: 10000,
                pongTimeout: 5000,
                unavailableTimeout: 3000,
            });
        } else {
            this.conn = new Pusher('kchat-key', {
                wsHost: connectionUrl,
                httpHost: connectionUrl,
                authEndpoint: '/broadcasting/auth',
                enabledTransports: ['ws', 'wss'],
                disabledTransports: ['xhr_streaming', 'xhr_polling', 'sockjs'],
                activityTimeout: 10000,
                pongTimeout: 5000,
                unavailableTimeout: 3000,
            });
        }

        this.connectionUrl = connectionUrl;

        this.conn.connection.bind('state_change', (states: { current: string; previous: string }) => {
            console.log('[websocket] current state is: ', states.current);

            if (states.current === 'unavailable' || states.current === 'failed') {
                this.connectFailCount++;
                console.log('[websocket] connectFailCount updated: ', this.connectFailCount);

                this.closeCallback?.(this.connectFailCount);
                this.closeListeners.forEach((listener) => listener(this.connectFailCount));
            }
        });

        this.conn.connection.bind('error', (evt: any) => {
            console.log('[websocket] unexpected error: ', evt);
            this.errorCount++;
            this.connectFailCount++;

            // Unbind any Pusher event listeners before disconnecting Pusher instance
            this.unbindPusherEvents();
            this.unbindGlobalsAndReset();
            this.conn?.disconnect();
            this.conn = null;
            console.log('websocket closed');

            console.log('[websocket] calling close callbacks');

            this.closeCallback?.(this.connectFailCount);
            this.closeListeners.forEach((listener) => listener(this.connectFailCount));

            let retryTime = MIN_WEBSOCKET_RETRY_TIME;

            // If we've failed a bunch of connections then start backing off
            if (this.connectFailCount > MAX_WEBSOCKET_FAILS) {
                retryTime = MIN_WEBSOCKET_RETRY_TIME * this.connectFailCount * this.connectFailCount;
                if (retryTime > MAX_WEBSOCKET_RETRY_TIME) {
                    retryTime = MAX_WEBSOCKET_RETRY_TIME;
                }
            }

            // Applying jitter to avoid thundering herd problems.
            retryTime += Math.random() * JITTER_RANGE;

            setTimeout(
                () => {
                    this.initialize(
                        connectionUrl,
                        this.currentUser as number,
                        this.currentTeamUser,
                        this.currentTeam,
                        authToken,
                        this.currentPresence,
                    );
                },
                retryTime,
            );
        });

        this.conn.connection.bind('connected', () => {
            this.subscribeToTeamChannel(teamId as string);
            this.subscribeToUserChannel(userId || currentUserId);
            this.subscribeToUserTeamScopedChannel(userTeamId || currentUserTeamId);

            const presenceChannel = presenceChannelId || currentPresenceChannelId;
            if (presenceChannel) {
                this.bindPresenceChannel(presenceChannel);
            }
            this.bindChannelGlobally(this.teamChannel);
            this.bindChannelGlobally(this.userChannel);

            // unbind previous listeners if needed to prevent duplicated callbacks
            // TODO: obsolete, remove now that disconnect does a global unbind
            if (this.userTeamChannel && this.userTeamChannel.global_callbacks.length > 0) {
                this.userTeamChannel.unbind_global();
            }
            this.bindChannelGlobally(this.userTeamChannel);

            console.log('[websocket] re-established connection');
            if (this.connectFailCount > 0) {
                console.log('[websocket] calling reconnect callbacks');
                console.log('[websocket] socketId', this.conn?.connection.socket_id);
                this.reconnectCallback?.(this.conn?.connection.socket_id);
                this.reconnectListeners.forEach((listener) => listener(this.conn?.connection.socket_id));
            } else if (this.firstConnectCallback || this.firstConnectListeners.size > 0) {
                console.log('[websocket] calling first connect callbacks');
                console.log('[websocket] socketId', this.conn?.connection.socket_id);
                this.firstConnectCallback?.(this.conn?.connection.socket_id);
                this.firstConnectListeners.forEach((listener) => listener(this.conn?.connection.socket_id));
            }
            this.connectFailCount = 0;
            this.errorCount = 0;
            this.socketId = this.conn?.connection.socket_id as string;
        });
    }

    updateToken(token: string) {
        if (this.conn) {
            this.conn.disconnect();
            this.conn = null;
            this.initialize(
                this.connectionUrl,
                this.currentUser as number,
                this.currentTeamUser,
                this.currentTeam,
                token,
                this.currentPresence,
            );
        }
    }

    subscribeToTeamChannel(teamId: string) {
        this.currentTeam = teamId;
        this.teamChannel = this.conn?.subscribe(`private-team.${teamId}`) as Channel;
    }

    subscribeToUserChannel(userId: number) {
        this.currentUser = userId;
        this.userChannel = this.conn?.subscribe(`presence-user.${userId}`) as Channel;
    }

    subscribeToUserTeamScopedChannel(teamUserId: string) {
        this.currentTeamUser = teamUserId;
        this.userTeamChannel = this.conn?.subscribe(`presence-teamUser.${teamUserId}`) as Channel;
    }

    bindPresenceChannel(channelID: string) {
        this.currentPresence = channelID;
        this.presenceChannel = this.conn?.subscribe(`presence-channel.${channelID}`) as Channel;
        if (this.presenceChannel) {
            this.bindChannelGlobally(this.presenceChannel);
        }
    }

    unbindPresenceChannel(channelID: string) {
        this.conn?.unsubscribe(`presence-channel.${channelID}`);

        if (this.presenceChannel) {
            this.unbindChannelGlobally(this.presenceChannel);
        }
    }

    bindChannelGlobally(channel: Channel | null) {
        // @ts-ignore
        channel?.bind_global((evt, data) => {
            // console.error(`The event ${evt} was triggered with data`);
            // console.error(data);

            if (!data) {
                return;
            }

            if (data.seq_reply) {
                // This indicates a reply to a websocket request.
                // We ignore sequence number validation of message responses
                // and only focus on the purely server side event stream.
                if (data.error) {
                    console.log(data); //eslint-disable-line no-console
                }

                if (this.responseCallbacks[data.seq_reply]) {
                    this.responseCallbacks[data.seq_reply](data);
                    Reflect.deleteProperty(this.responseCallbacks, data.seq_reply);
                }
            } else if (this.eventCallback || this.messageListeners.size > 0) {
                // @ts-ignore
                this.eventCallback?.({event: evt, data});

                // @ts-ignore
                this.messageListeners.forEach((listener) => listener({event: evt, data}));
            }
        });
    }

    unbindChannelGlobally(channel: Channel | null) {
        // @ts-ignore
        channel.unbind_global((evt, data) => {
            if (!data) {
                return;
            }
            if (data.seq_reply) {
                if (data.error) {
                    console.log(data); //eslint-disable-line no-console
                }

                if (this.responseCallbacks[data.seq_reply]) {
                    this.responseCallbacks[data.seq_reply](data);
                    Reflect.deleteProperty(this.responseCallbacks, data.seq_reply);
                }
            } else if (this.eventCallback) {
                // @ts-ignore
                this.serverSequence = data.seq + 1;

                // @ts-ignore
                this.eventCallback({event: evt, data});
            }
        });
    }

    /**
     * @deprecated Use addMessageListener instead
     */
    setEventCallback(callback: MessageListener) {
        this.eventCallback = callback;
    }

    addMessageListener(listener: MessageListener) {
        this.messageListeners.add(listener);

        if (this.messageListeners.size > 5) {
            // eslint-disable-next-line no-console
            console.warn(`WebSocketClient has ${this.messageListeners.size} message listeners registered`);
        }
    }

    removeMessageListener(listener: MessageListener) {
        this.messageListeners.delete(listener);
    }

    /**
     * @deprecated Use addFirstConnectListener instead
     */
    setFirstConnectCallback(callback: FirstConnectListener) {
        this.firstConnectCallback = callback;
    }

    addFirstConnectListener(listener: FirstConnectListener) {
        this.firstConnectListeners.add(listener);

        if (this.firstConnectListeners.size > 5) {
            // eslint-disable-next-line no-console
            console.warn(`WebSocketClient has ${this.firstConnectListeners.size} first connect listeners registered`);
        }
    }

    removeFirstConnectListener(listener: FirstConnectListener) {
        this.firstConnectListeners.delete(listener);
    }

    /**
     * @deprecated Use addReconnectListener instead
     */
    setReconnectCallback(callback: ReconnectListener) {
        this.reconnectCallback = callback;
    }

    addReconnectListener(listener: ReconnectListener) {
        this.reconnectListeners.add(listener);

        if (this.reconnectListeners.size > 5) {
            // eslint-disable-next-line no-console
            console.warn(`WebSocketClient has ${this.reconnectListeners.size} reconnect listeners registered`);
        }
    }

    removeReconnectListener(listener: ReconnectListener) {
        this.reconnectListeners.delete(listener);
    }

    /**
     * @deprecated Use addMissedMessageListener instead
     */
    setMissedEventCallback(callback: MissedMessageListener) {
        this.missedEventCallback = callback;
    }

    addMissedMessageListener(listener: MissedMessageListener) {
        this.missedMessageListeners.add(listener);

        if (this.missedMessageListeners.size > 5) {
            // eslint-disable-next-line no-console
            console.warn(`WebSocketClient has ${this.missedMessageListeners.size} missed message listeners registered`);
        }
    }

    removeMissedMessageListener(listener: MissedMessageListener) {
        this.missedMessageListeners.delete(listener);
    }

    /**
     * @deprecated Use addErrorListener instead
     */
    setErrorCallback(callback: ErrorListener) {
        this.errorCallback = callback;
    }

    addErrorListener(listener: ErrorListener) {
        this.errorListeners.add(listener);

        if (this.errorListeners.size > 5) {
            // eslint-disable-next-line no-console
            console.warn(`WebSocketClient has ${this.errorListeners.size} error listeners registered`);
        }
    }

    removeErrorListener(listener: ErrorListener) {
        this.errorListeners.delete(listener);
    }

    /**
     * @deprecated Use addCloseListener instead
     */
    setCloseCallback(callback: CloseListener) {
        this.closeCallback = callback;
    }

    addCloseListener(listener: CloseListener) {
        this.closeListeners.add(listener);

        if (this.closeListeners.size > 5) {
            // eslint-disable-next-line no-console
            console.warn(`WebSocketClient has ${this.closeListeners.size} close listeners registered`);
        }
    }

    removeCloseListener(listener: CloseListener) {
        this.closeListeners.delete(listener);
    }

    close() {
        this.connectFailCount = 0;
        this.responseSequence = 1;

        if (this.conn && this.conn.connection.state === 'connected') {
            // Unbind any Pusher event listeners before disconnecting Pusher instance
            this.unbindPusherEvents();
            this.unbindGlobalsAndReset();
            this.conn.disconnect();
            this.conn = null;
            console.log('websocket closed'); //eslint-disable-line no-console
        }
    }

    sendMessage(action: string, data: any, responseCallback?: () => void) {
        const msg = {
            action,
            seq: this.responseSequence++,
            data,
        };

        if (responseCallback) {
            this.responseCallbacks[msg.seq] = responseCallback;
        }

        if (this.conn && this.conn.connection.state === 'connected') {
            this.userChannel?.trigger(action, msg);
        } else if (!this.conn || this.conn.connection.state === 'disconnected') {
            console.log('[websocket] tried to send message but connection unavailable');

            // Sentry.captureException(new Error('Websocket tried to send message but connection unavailable'));

            // this.conn = null;

            // //@ts-ignore
            // this.initialize(this.connectionId, this.currentUser as number, this.currentTeam, undefined, localStorage.getItem('IKToken'), this.currentPresence);
        }
    }

    sendPresenceMessage(action: string, data: any, responseCallback?: () => void) {
        const msg = {
            action,
            seq: this.responseSequence++,
            data,
        };

        if (responseCallback) {
            this.responseCallbacks[msg.seq] = responseCallback;
        }

        if (this.conn && this.presenceChannel && this.conn.connection.state === 'connected') {
            this.presenceChannel?.trigger(action, msg);
        } else if (!this.conn || this.conn.connection.state === 'disconnected' || !this.presenceChannel) {
            console.log('presence channel is missing');
            console.log('connection: ', this.conn);
            console.log('connection state: ', this.conn?.connection.state);
            console.log('presence channel: ', this.presenceChannel);

            // this.bindPresenceChannel(data.channel_id);
        }
    }

    userTyping(channelId: string, userId: string, parentId: string, callback?: () => void) {
        const data = {
            channel_id: channelId,
            parent_id: parentId,
            user_id: userId,
        };
        this.sendPresenceMessage('client-user_typing', data, callback);
    }

    userUpdateActiveStatus(userIsActive: boolean, manual: boolean, callback?: () => void) {
        const data = {
            user_is_active: userIsActive,
            manual,
        };
        this.sendMessage('client-user_update_active_status', data, callback);
    }

    getStatuses(callback?: () => void) {
        this.sendMessage('client-get_statuses', null, callback);
    }

    getStatusesByIds(userIds: string[], callback?: () => void) {
        const data = {
            user_ids: userIds,
        };
        this.sendMessage('client-get_statuses_by_ids', data, callback);
    }
}

export type WebSocketBroadcast = {
    omit_users: Record<string, boolean>;
    user_id: string;
    channel_id: string;
    team_id: string;
}

export type WebSocketMessage<T = any> = {
    event: string;
    data: T;
    broadcast: WebSocketBroadcast;
    seq: number;
}
