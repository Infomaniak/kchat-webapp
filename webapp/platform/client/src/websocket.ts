/* eslint-disable no-underscore-dangle */
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import type {Channel} from 'pusher-js';
import Pusher from 'pusher-js';

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
export type OtherTeam = { userId: string; teamId: string }

export type WebSocketClientConfig = {
    maxWebSocketFails: number;
    minWebSocketRetryTime: number;
    maxWebSocketRetryTime: number;
    reconnectJitterRange: number;
    newWebSocketFn: (url: string) => WebSocket;
    clientPingInterval: number;
}

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
    private otherTeams: OtherTeam[];
    private otherTeamsChannel: Record<string, Channel[]>;

    // responseSequence is the number to track a response sent
    // via the websocket. A response will always have the same sequence number
    // as the request.
    private responseSequence: number;

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
    private otherServersMessageListeners = new Set<MessageListener>();

    private connectionId: string | null;

    private _teamId: string | undefined;
    private _userId: number | undefined;
    private _userTeamId: string | undefined;

    // TODO type this
    private _currentUserId: any;
    private _currentUserTeamId: any;
    private _presenceChannelId: any;

    reconnecting: boolean = false;

    constructor() {
        this.conn = null;
        this.teamChannel = null;
        this.userChannel = null;
        this.userTeamChannel = null;
        this.presenceChannel = null;
        this.connectionUrl = null;
        this.responseSequence = 1;
        this.connectFailCount = 0;
        this.errorCount = 0;
        this.responseCallbacks = {};
        this.connectionId = '';
        this.socketId = null;
        this.currentPresence = '';
        this.currentUser = null;
        this.currentTeamUser = '';
        this.currentTeam = '';
        this.otherTeams = [];
        this.otherTeamsChannel = {};

        this._teamId = undefined;
        this._userId = undefined;
        this._currentUserId = undefined;
        this._userTeamId = undefined;
        this._currentUserTeamId = undefined;
        this._presenceChannelId = undefined;
    }

    unbindPusherEvents() {
        this.conn?.connection.unbind('state_change');
        this.conn?.connection.unbind('error');
        this.conn?.connection.unbind('connected');
    }

    unbindGlobalsAndReset() {
        console.log('unbindGlobalsAndReset');
        this.teamChannel?.unbind('pusher:subscription_succeeded');
        this.teamChannel?.unbind_global();
        this.userChannel?.unbind('pusher:subscription_succeeded');
        this.userChannel?.unbind_global();
        this.userTeamChannel?.unbind('pusher:subscription_succeeded');
        this.userTeamChannel?.unbind_global();
        this.presenceChannel?.unbind_global();
        Object.values(this.otherTeamsChannel)?.forEach((team) => team.forEach((channel) => channel.unbind_all()));
        this.teamChannel = null;
        this.userChannel = null;
        this.userTeamChannel = null;
        this.presenceChannel = null;
        this.otherTeamsChannel = {};
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
        const debugId = `[WS initialize-${Date.now()}]`;
        console.debug(`${debugId} Initializing WebSocket with URL: ${connectionUrl}`);

        let currentUserId: any;
        let currentUserTeamId: any;

        if (userId) {
            currentUserId = userId;
        }

        if (userTeamId) {
            currentUserTeamId = userTeamId;
        }

        if (presenceChannelId) {
            this.currentPresence = presenceChannelId;
        }

        if (this.conn) {
            console.debug(`${debugId} WebSocket already connected, skipping init`);
            return;
        }

        if (!connectionUrl) {
            console.log(`${debugId} Missing connection URL`);
            return;
        }

        if (this.connectFailCount === 0) {
            console.log(`${debugId} Connecting to ${connectionUrl}`);
        }

        console.debug(`${debugId} Current listener counts`, {
            closeListeners: this.closeListeners?.size || 0,
            reconnectListeners: this.reconnectListeners?.size || 0,
            firstConnectListeners: this.firstConnectListeners?.size || 0,
        });

        const auth = isDesktopApp() ? {headers: {Authorization: `Bearer ${authToken}`}} : {};

        this.conn = new Pusher('kchat-key', {
            wsHost: connectionUrl,
            httpHost: connectionUrl,
            cluster: 'mt1',
            authEndpoint: '/broadcasting/auth',
            auth,
            enabledTransports: ['ws', 'wss'],
            disabledTransports: ['xhr_streaming', 'xhr_polling', 'sockjs'],
            activityTimeout: 10000,
            pongTimeout: 5000,
            forceTLS: true,
        });

        this.connectionUrl = connectionUrl;

        this.conn.connection.bind('state_change', (states: { current: string; previous: string }) => {
            console.log(`${debugId} Connection state change: ${states.previous} → ${states.current}`);

            if (
                states.current === 'unavailable' ||
                states.current === 'failed' ||
                (states.previous === 'connected' && states.current === 'connecting')
            ) {
                this.connectFailCount++;
                console.log(`${debugId} connectFailCount incremented: ${this.connectFailCount}`);

                this.closeCallback?.(this.connectFailCount);
                this.closeListeners.forEach((listener, i) => {
                    console.debug(`${debugId} Calling closeListener [${i}]`);
                    listener(this.connectFailCount);
                });
            }
        });

        this.conn.connection.bind('error', (evt: any) => {
            console.log(`${debugId} Unexpected WebSocket error:`, evt);
            this.errorCount++;
            this.connectFailCount++;

            if (this.presenceChannel) {
                this.conn?.unsubscribe(this.presenceChannel.name);
                this.presenceChannel.unbind_all();
                this.presenceChannel = null;
            }

            console.log(`${debugId} Triggering close callbacks after error`);
            this.closeCallback?.(this.connectFailCount);
            this.closeListeners.forEach((listener, i) => {
                console.debug(`${debugId} Calling closeListener [${i}]`);
                listener(this.connectFailCount);
            });
        });

        this.conn.connection.bind('connected', () => {
            console.log(`${debugId} Connected with socketId: ${this.conn?.connection.socket_id}`);

            this._teamId = teamId;
            this._userId = userId;
            this._currentUserId = currentUserId;
            this._userTeamId = userTeamId;
            this._currentUserTeamId = currentUserTeamId;
            this._presenceChannelId = presenceChannelId;

            if (this.connectFailCount > 0) {
                this.reconnecting = true;
                console.log(`${debugId} Detected reconnecting state`);

                if (this.reconnectListeners.size <= 0 && !this.reconnectCallback) {
                    console.warn(`${debugId} No reconnect handlers found, reloading app`);
                    window.location.reload();
                    return;
                }

                this.reconnectCallback?.(this.conn?.connection.socket_id);
                this.reconnectListeners.forEach((listener, i) => {
                    console.debug(`${debugId} Calling reconnectListener [${i}]`);
                    listener(this.conn?.connection.socket_id);
                });
            } else if (this.firstConnectCallback || this.firstConnectListeners.size > 0) {
                this.reconnectAllChannels();
                console.log(`${debugId} First connection, triggering initial handlers`);
                this.firstConnectCallback?.(this.conn?.connection.socket_id);
                this.firstConnectListeners.forEach((listener) => {
                    const funcName = listener.name || '<anonymous>';
                    console.debug(`${debugId} Calling firstConnectListener (${funcName})`);
                    listener(this.conn?.connection.socket_id);
                });
            }

            this.connectFailCount = 0;
            this.errorCount = 0;
            this.socketId = this.conn?.connection.socket_id as string;

            console.log(`${debugId} Initialization complete`);
        });
    }

    reconnectAllChannels() {
        const debugId = `[WS reconnectAllChannels-${Date.now()}]`;
        console.log(`${debugId} state`, this.conn?.connection.state);
        if (this.conn?.connection.state !== 'connected') {
            console.log(`${debugId} retrying`);
            setTimeout(() => {
                this.reconnectAllChannels();
            }, 2000);

            return;
        }
        this.subscribeToTeamChannel(this._teamId as string);
        this.subscribeToUserChannel(this._userId || this._currentUserId);
        this.subscribeToUserTeamScopedChannel(this._userTeamId || this._currentUserTeamId);
        this.subscribeToOtherTeams(this.otherTeams, this._teamId);

        const presenceChannel = this._presenceChannelId || this.currentPresence;
        if (presenceChannel) {
            this.bindPresenceChannel(presenceChannel);
        }

        this.reconnecting = false;

        console.log(`${debugId} connected at`, Date.now());
    }

    updateToken(token: string) {
        const debugId = `[WS updateToken-${Date.now()}]`;
        console.debug(`${debugId} Updating token`);

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
        const debugId = `[WS subscribeToTeamChannel-${Date.now()}]`;
        if (this.teamChannel) {
            this.conn?.unsubscribe(this.teamChannel.name);
            this.teamChannel.unbind_all();
            this.teamChannel = null;
        }

        console.log(`${debugId} private-team.${teamId}`);
        this.currentTeam = teamId;
        this.teamChannel = this.conn?.subscribe(`private-team.${teamId}`) as Channel;
        this.bindChannelGlobally(this.teamChannel);

        this.teamChannel?.bind('pusher:subscription_error', () => {
            console.log(`${debugId} failed to subscribe to private-team.${teamId} queuing retry`);

            setTimeout(() => {
                this.subscribeToTeamChannel(teamId);
            }, JITTER_RANGE);
        });
    }

    subscribeToUserChannel(userId: number) {
        const debugId = `[WS subscribeToUserChannel-${Date.now()}]`;
        if (this.userChannel) {
            this.conn?.unsubscribe(this.userChannel.name);
            this.userChannel.unbind_all();
            this.userChannel = null;
        }

        console.log(`${debugId} presence-user.${userId}`);
        this.currentUser = userId;
        this.userChannel = this.conn?.subscribe(`presence-user.${userId}`) as Channel;
        this.bindChannelGlobally(this.userChannel);

        this.userChannel?.bind('pusher:subscription_error', () => {
            console.log(`${debugId} failed to subscribe to presence-user.${userId} queuing retry`);

            setTimeout(() => {
                this.subscribeToUserChannel(userId);
            }, JITTER_RANGE);
        });
    }

    subscribeToUserTeamScopedChannel(teamUserId: string) {
        const debugId = `[WS subscribeTeamUser-${Date.now()}]`;
        if (this.userTeamChannel) {
            this.conn?.unsubscribe(this.userTeamChannel.name);
            this.userTeamChannel.unbind_all();
            this.userTeamChannel = null;
        }

        console.log(`${debugId} presence-teamUser.${teamUserId}`);
        this.currentTeamUser = teamUserId;
        this.userTeamChannel = this.conn?.subscribe(`presence-teamUser.${teamUserId}`) as Channel;
        this.bindChannelGlobally(this.userTeamChannel);

        this.userTeamChannel?.bind('pusher:subscription_error', () => {
            console.log(`${debugId} failed to subscribe to presence-teamUser.${teamUserId} queuing retry`);

            setTimeout(() => {
                this.subscribeToUserTeamScopedChannel(teamUserId);
            }, JITTER_RANGE);
        });
    }

    bindPresenceChannel(channelID: string) {
        const debugId = `[WS bindPresence-${Date.now()}]`;
        console.log(`${debugId} presence-channel.${channelID}`);
        this.currentPresence = channelID;
        this.presenceChannel = this.conn?.subscribe(`presence-channel.${channelID}`) as Channel;
        if (this.presenceChannel) {
            this.bindChannelGlobally(this.presenceChannel);
        }
    }

    unbindPresenceChannel(channelID: string) {
        const debugId = `[WS unbindPresence-${Date.now()}]`;
        console.log(`${debugId} presence-channel.${channelID}`);
        this.conn?.unsubscribe(`presence-channel.${channelID}`);

        if (this.presenceChannel) {
            this.unbindChannelGlobally(this.presenceChannel);
        }
    }

    bindChannelGlobally(channel: Channel | null) {
        // @ts-expect-error old error ignore
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
                // @ts-expect-error old error ignore
                this.eventCallback?.({event: evt, data});

                // @ts-expect-error old error ignore
                this.messageListeners.forEach((listener) => listener({event: evt, data}));
            }
        });
    }

    unbindChannelGlobally(channel: Channel | null) {
        // @ts-expect-error old error ignore
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
                // @ts-expect-error old error ignore
                this.serverSequence = data.seq + 1;

                // @ts-expect-error old error ignore
                this.eventCallback({event: evt, data});
            }
        });
    }

    bindChannelToEvent(channel: Channel, eventName: string, callback?: (data: any) => void) {
        channel.bind(eventName, (data: any) => {
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
            } else if (callback) {
                // @ts-expect-error old error ignore
                this.serverSequence = data.seq + 1;

                callback?.(data);
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

    addOtherServerMessageListener(listener: MessageListener) {
        this.otherServersMessageListeners.add(listener);

        if (this.otherServersMessageListeners.size > 5) {
            // eslint-disable-next-line no-console
            console.warn(`WebSocketClient has ${this.messageListeners.size} message listeners registered`);
        }
    }

    removeOtherServerMessageListener(listener: MessageListener) {
        this.otherServersMessageListeners.delete(listener);
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
            this.conn.disconnect();

            // this.conn = null;
            console.log('websocket closed'); //eslint-disable-line no-console
        }
    }

    sendMessage(action: string, data: any, responseCallback?: (msg: any) => void) {
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
            console.error('[websocket] tried to send message but connection unavailable');

            this.conn?.disconnect();
            this.conn = null;

            this.initialize(
                this.connectionUrl,
                this.currentUser as number,
                this.currentTeamUser,
                this.currentTeam,
                localStorage.getItem('IKToken') as string,
                this.currentPresence,
            );
        }
    }

    sendUserTeamMessage(action: string, data: any, responseCallback?: () => void) {
        const msg = {
            action,
            seq: this.responseSequence++,
            data,
        };

        if (responseCallback) {
            this.responseCallbacks[msg.seq] = responseCallback;
        }

        if (this.conn && this.conn.connection.state === 'connected') {
            this.userTeamChannel?.trigger(action, msg);
        } else if (!this.conn || this.conn.connection.state === 'disconnected') {
            console.error('[websocket] tried to send message but connection unavailable');

            this.conn?.disconnect();
            this.conn = null;

            this.initialize(
                this.connectionUrl,
                this.currentUser as number,
                this.currentTeamUser,
                this.currentTeam,
                localStorage.getItem('IKToken') as string,
                this.currentPresence,
            );
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
            console.error('[websocket] presence channel is missing');
            console.log('[websocket] connection state: ', this.conn?.connection.state);

            this.conn?.disconnect();
            this.conn = null;

            this.initialize(
                this.connectionUrl,
                this.currentUser as number,
                this.currentTeamUser,
                this.currentTeam,
                localStorage.getItem('IKToken') as string,
                this.currentPresence,
            );
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

    userRecording(channelId: string, userId: string, parentId: string, callback?: () => void) {
        const data = {
            channel_id: channelId,
            parent_id: parentId,
            user_id: userId,
        };
        this.sendPresenceMessage('client-user_recording', data, callback);
    }

    updateActiveChannel() {
        throw new Error('IK: not implemented');
    }

    updateActiveTeam() {
        throw new Error('IK: not implemented');
    }

    updateActiveThread() {
        throw new Error('IK: not implemented');
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

    sendRemoveUnread(unreadMessagesCount: number, serverId: string) {
        const data = {
            unreadMessagesCount,
            serverId,
        };

        this.sendUserTeamMessage('client-unread_channel', data);
    }

    setOthersTeams(teams: OtherTeam[]) {
        this.otherTeams = teams;
    }

    subscribeToOtherTeams(teams?: OtherTeam[], currentTeamId?: string) {
        if (!teams) {
            return;
        }

        for (const team of teams) {
            const {teamId, userId} = team;

            if (teamId === currentTeamId || !userId) {
                continue;
            }

            const presenceTeamUserChannel = this.conn?.subscribe(`presence-teamUser.${userId}`) as Channel;
            const privateTeamChannel = this.conn?.subscribe(`private-team.${teamId}`) as Channel;

            presenceTeamUserChannel.callbacks.remove('badge_updated');
            privateTeamChannel.callbacks.remove('team_status_changed');

            this.bindChannelToEvent(presenceTeamUserChannel, 'badge_updated', (data) => {
                // @ts-expect-error old error ignore
                this.otherServersMessageListeners.forEach((listener) => listener({event: 'badge_updated', data, serverId: teamId}));
            });

            this.bindChannelToEvent(privateTeamChannel, 'team_status_changed', (data) => {
                // @ts-expect-error old error ignore
                this.otherServersMessageListeners.forEach((listener) => listener({event: 'team_status_changed', data, serverId: teamId}));
            });

            Reflect.set(this.otherTeamsChannel, teamId, [presenceTeamUserChannel, privateTeamChannel]);
        }
    }

    addNewTeam(userId: string, teamId: string, currentTeamId: string) {
        const newTeam = {userId, teamId};
        this.otherTeams.push(newTeam);
        this.subscribeToOtherTeams([newTeam], currentTeamId);
    }

    removeTeam(teamId: string) {
        const newTeams = this.otherTeams.filter((team) => team.teamId !== teamId);
        const channelsToUnbind = Reflect.get(this.otherTeamsChannel, teamId);
        const newChannels = {...this.otherTeamsChannel};
        Reflect.deleteProperty(newChannels, teamId);

        if (channelsToUnbind && Array.isArray(channelsToUnbind) && this.conn?.connection.state === 'connected') {
            this.unsubscribeChannels(channelsToUnbind);
        }

        this.otherTeams = newTeams;
        this.otherTeamsChannel = newChannels;
    }

    unsubscribeChannels(channels: Channel[]) {
        channels.forEach((channel) => {
            this.conn?.unsubscribe(channel.name);
            channel.unbind_all();
        });
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
