// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Pusher, {Channel} from 'pusher-js';

import {isDesktopApp} from 'utils/user_agent';
import {Client4} from 'mattermost-redux/client';

// import {SocketEvents} from 'utils/constants';

const MAX_WEBSOCKET_FAILS = 7;
const MIN_WEBSOCKET_RETRY_TIME = 3000; // 3 sec
const MAX_WEBSOCKET_RETRY_TIME = 300000; // 5 mins

const WEBSOCKET_HELLO = 'hello';

export type MessageListener = (msg: WebSocketMessage) => void;
export type FirstConnectListener = () => void;
export type ReconnectListener = () => void;
export type MissedMessageListener = () => void;
export type ErrorListener = (event: Event) => void;
export type CloseListener = (connectFailCount: number) => void;

export default class WebSocketClient {
    private conn: Pusher | null;
    private teamChannel: Channel | null;
    private userChannel: Channel | null;
    private presenceChannel: Channel | null;
    private connectionUrl: string | null;

    // responseSequence is the number to track a response sent
    // via the websocket. A response will always have the same sequence number
    // as the request.
    private responseSequence: number;

    // serverSequence is the incrementing sequence number from the
    // server-sent event stream.
    private serverSequence: number;
    private connectFailCount: number;
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
        this.presenceChannel = null;
        this.connectionUrl = null;
        this.responseSequence = 1;
        this.serverSequence = 0;
        this.connectFailCount = 0;
        this.responseCallbacks = {};
        this.connectionId = '';
    }

    // on connect, only send auth cookie and blank state.
    // on hello, get the connectionID and store it.
    // on reconnect, send cookie, connectionID, sequence number.
    initialize(connectionUrl = this.connectionUrl, userId?: number, teamId?: string, token?: string) {
        let currentUserId;

        // Store this for onmessage reconnect
        if (userId) {
            currentUserId = userId;
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

        Pusher.Runtime.createXHR = () => {
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            return xhr;
        };

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
                        Authorization: `Bearer ${Client4.getToken() && Client4.getToken()}`,
                    },
                },
                wsPort: 443,
                wssPort: 443,
                httpPort: 443,
                httpsPort: 443,
                forceTLS: true,
                enabledTransports: ['ws', 'wss'],
            });
        } else {
            this.conn = new Pusher('kchat-key', {
                wsHost: connectionUrl,
                httpHost: connectionUrl,
                authEndpoint: '/broadcasting/auth',
                wsPort: 443,
                wssPort: 443,
                httpPort: 443,
                httpsPort: 443,
                forceTLS: true,
                enabledTransports: ['ws', 'wss'],
            });
        }

        this.connectionUrl = connectionUrl;

        this.subscribeToTeamChannel(teamId);
        this.subscribeToUserChannel(userId || currentUserId);

        this.conn.connection.bind('connected', () => {
            if (token) {
                this.sendMessage('authentication_challenge', {token});
            }

            if (this.connectFailCount > 0) {
                console.log('websocket re-established connection'); //eslint-disable-line no-console

                this.reconnectCallback?.();
                this.reconnectListeners.forEach((listener) => listener());
            } else if (this.firstConnectCallback || this.firstConnectListeners.size > 0) {
                this.firstConnectCallback?.();
                this.firstConnectListeners.forEach((listener) => listener());
            }

            this.connectFailCount = 0;
        });

        this.conn.connection.bind('disconnected', () => {
            this.conn = null;
            this.responseSequence = 1;

            if (this.connectFailCount === 0) {
                console.log('websocket closed'); //eslint-disable-line no-console
            }

            this.connectFailCount++;

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

            setTimeout(
                () => {
                    this.initialize(connectionUrl, userId, teamId, token);
                },
                retryTime,
            );
        });

        this.conn.connection.bind('error', (evt) => {
            if (this.connectFailCount <= 1) {
                console.log('websocket error'); //eslint-disable-line no-console
                console.log(evt); //eslint-disable-line no-console
            }

            this.errorCallback?.(evt);
            this.errorListeners.forEach((listener) => listener(evt));
        });

        this.bindChannelGlobally(this.teamChannel);
        this.bindChannelGlobally(this.userChannel);
    }

    subscribeToTeamChannel(teamId: string) {
        this.teamChannel = this.conn.subscribe(`private-team.${teamId}`);
    }

    subscribeToUserChannel(userId: number) {
        this.userChannel = this.conn.subscribe(`presence-user.${userId}`);
    }

    bindPresenceChannel(channelID: string) {
        this.presenceChannel = this.conn?.subscribe(`presence-channel.${channelID}`);
        if (this.presenceChannel) {
            this.bindChannelGlobally(this.presenceChannel);
        }
    }

    unbindPresenceChannel(channelID: string) {
        this.presenceChannel = this.conn?.unsubscribe(`presence-channel.${channelID}`);
        if (this.presenceChannel) {
            this.unbindChannelGlobally(this.presenceChannel);
        }
    }

    bindChannelGlobally(channel: Channel | null) {
        channel.bind_global((evt, data) => {
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
                // We check the hello packet, which is always the first packet in a stream.
                if (evt === WEBSOCKET_HELLO && (this.missedEventCallback || this.missedMessageListeners.size > 0)) {
                    console.log('got connection id ', data.connection_id); //eslint-disable-line no-console
                    // If we already have a connectionId present, and server sends a different one,
                    // that means it's either a long timeout, or server restart, or sequence number is not found.
                    // Then we do the sync calls, and reset sequence number to 0.
                    if (this.connectionId !== '' && this.connectionId !== data.connection_id) {
                        console.log('long timeout, or server restart, or sequence number is not found.'); //eslint-disable-line no-console

                        this.missedEventCallback?.();
                        this.missedMessageListeners.forEach((listener) => listener());

                        this.serverSequence = 0;
                    }

                    // If it's a fresh connection, we have to set the connectionId regardless.
                    // And if it's an existing connection, setting it again is harmless, and keeps the code simple.
                    this.connectionId = data.connection_id;
                }

                // Now we check for sequence number, and if it does not match,
                // we just disconnect and reconnect.
                if (data.seq !== this.serverSequence) {
                    console.log('missed websocket event, act_seq=' + data.seq + ' exp_seq=' + this.serverSequence); //eslint-disable-line no-console
                    // We are not calling this.close() because we need to auto-restart.
                    this.connectFailCount = 0;
                    this.responseSequence = 1;
                    this.conn?.disconnect(); // Will auto-reconnect after MIN_WEBSOCKET_RETRY_TIME.
                    return;
                }
                this.serverSequence = data.seq + 1;

                this.eventCallback?.({event: evt, data});
                this.messageListeners.forEach((listener) => listener({event: evt, data}));
            }
        });
    }

    unbindChannelGlobally(channel: Channel | null) {
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
                this.serverSequence = data.seq + 1;
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
    }

    removeCloseListener(listener: CloseListener) {
        this.closeListeners.delete(listener);
    }

    close() {
        this.connectFailCount = 0;
        this.responseSequence = 1;
        if (this.conn && this.conn.connection.state === 'connected') {
            this.conn.connection.bind('disconnected', () => {
            });
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
            this.conn = null;
            this.initialize(null, null, data.channel_id);
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

        if (this.conn && this.conn.connection.state === 'connected') {
            this.presenceChannel?.trigger(action, msg);
        } else if (!this.conn || this.conn.connection.state === 'disconnected') {
            this.conn = null;
            this.bindPresenceChannel(data.channel_id);
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
