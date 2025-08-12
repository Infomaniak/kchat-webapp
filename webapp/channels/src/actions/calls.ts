// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ChannelType} from '@mattermost/types/channels';
import type {Call} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {bindClientFunc} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentChannelId, getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {
    callConferenceId,
    callParameters,
    callUserStatus,
    connectedCallID,
    connectedCallUrl,
    connectedChannelID,
    voiceConnectedChannels,
} from 'selectors/calls';
import {getCurrentLocale} from 'selectors/i18n';

import {getHistory} from 'utils/browser_history';
import {isDesktopExtendedCallSupported, openWebCallInNewTab} from 'utils/calls_utils';
import {ActionTypes, ModalIdentifiers} from 'utils/constants';
import {stopRing} from 'utils/notification_sounds';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';
import {imageURLForUser} from 'utils/utils';

import type {ActionFunc, ActionFuncAsync, DispatchFunc, GlobalState} from 'types/store';

import {openCallDialingModal} from './kmeet_calls';
import {closeModal} from './views/modals';

export function showExpandedView(): ActionFunc {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.SHOW_EXPANDED_VIEW,
        });

        return {data: true};
    };
}
export function hideExpandedView(): ActionFunc {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.HIDE_EXPANDED_VIEW,
        });

        return {data: true};
    };
}
export function showSwitchCallModal(targetID?: string): ActionFunc {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.SHOW_SWITCH_CALL_MODAL,
            data: {
                targetID,
            },
        });

        return {data: true};
    };
}

export function hideSwitchCallModal(): ActionFunc {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.HIDE_SWITCH_CALL_MODAL,
        });

        return {data: true};
    };
}

export function leaveCallInChannel(channelID: string, dialingID: string): ActionFuncAsync {
    return async (dispatch, getState) => {
        Client4.leaveMeet(dialingID);
        dispatch({
            type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
            data: {
                channelID,
                userID: getCurrentUserId(getState()),
                currentUserID: getCurrentUserId(getState()),
                callID: dialingID,
            },
        });

        return {data: true};
    };
}

//used only to answer last call brought by the dialing modal
export function joinCallInChannel(): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();
        const conferenceId = callConferenceId(state);
        await Client4.acceptIncomingMeetCall(conferenceId);
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        const {msg} = callParameters(state);
        stopRing();
        setTimeout(() => {
            if (msg) {
                const kmeetUrl = new URL(msg.url);
                // eslint-disable-next-line no-console
                console.log('[calls: joinCallInChannel]', msg.url);
                window.open(kmeetUrl.href, '_blank', 'noopener');
            }
        });

        return {data: true};
    };
}

// old simplified code for calls that just opens the link and fills store with the url.
// only used if FeatureFlagIkCallDialing is set to false.
export function startOrJoinCallInChannel(channelID: string): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();
        const channels = voiceConnectedChannels(state);

        let data;
        if (!connectedChannelID(getState()) && !channels[channelID]) {
            data = await Client4.startMeet(channelID);
            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });

            if (data && data.url) {
                const kmeetUrl = new URL(data.url);
                window.open(kmeetUrl.href, '_blank', 'noopener');
            }

            await dispatch({
                type: ActionTypes.VOICE_CHANNEL_USER_CONNECTED,
                data: {
                    channelID,
                    userID: getCurrentUserId(getState()),
                    currentUserID: getCurrentUserId(getState()),
                    url: data.url,
                    id: data.id,
                },
            });
        } else if (connectedCallUrl(state) !== null) {
            const kmeetUrl = new URL(connectedCallUrl(state));
            window.open(kmeetUrl.href, '_blank', 'noopener');
        }

        return {data: true};
    };
}

//used to manage action from postType actions and meet button
export function startOrJoinCallInChannelV2(channelID: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        try {
            let version;

            if (isDesktopApp()) {
                version = getDesktopVersion();
            }
            const data = await Client4.startMeet(channelID, version);
            const channel = getChannel(state, channelID);

            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });

            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ADDED,
                data: {
                    channelID,
                    userID: getCurrentUserId(state),
                    currentUserID: getCurrentUserId(state),
                    url: data?.url,
                    id: data?.id,
                    call: data,
                },
            });

            if (data && data.url) {
                const isOpenOrPrivateChannel = (channel.type === 'O' || channel.type === 'P');

                // prevent Autojoin when we are in DM or GM and launch directly KmeetWindow for Open and Private message
                if (isOpenOrPrivateChannel) {
                    if (isDesktopApp() && isDesktopExtendedCallSupported()) {
                        dispatch(startKmeetWindow(data.id, channel.id));
                        return;
                    }

                    // keep opening meeting in new tab for the webapp
                    openWebCallInNewTab(data.url, data.jwt, data.name);
                    return;
                }

                // keep ringing behaviour for DM and GM
                dispatch(openCallDialingModal(channelID));
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('call could not be started', error);
        }
    };
}

// Initiate a call if the URL contains the query parameter `call`
export function initiateCallIfParam(channelID: string) {
    return async (dispatch: DispatchFunc) => {
        const params = new URLSearchParams(window.location.search);
        const hasCallParam = params.has('call');

        if (hasCallParam) {
            dispatch(startOrJoinCallInChannelV2(channelID));

            params.delete('call');

            // Keep existing params if there is
            const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
            getHistory().replace(newUrl);
        }
    };
}

export function updateAudioStatus(dialingID: string, muted = false) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        dispatch({
            type: muted ? ActionTypes.VOICE_CHANNEL_USER_MUTED : ActionTypes.VOICE_CHANNEL_USER_UNMUTED,
            data: {
                userID: getCurrentUserId(getState()),
                callID: connectedCallID(getState()),
            },
        });
    };
}

export function updateCameraStatus(dialingID: string, muted = false) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        dispatch({
            type: muted ? ActionTypes.VOICE_CHANNEL_USER_VIDEO_OFF : ActionTypes.VOICE_CHANNEL_USER_VIDEO_ON,
            data: {
                userID: getCurrentUserId(getState()),
                callID: connectedCallID(getState()),
            },
        });
    };
}
export function updateScreenSharingStatus(dialingID: string, muted = false) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        dispatch({
            type: muted ? ActionTypes.VOICE_CHANNEL_USER_SCREEN_OFF : ActionTypes.VOICE_CHANNEL_USER_SCREEN_ON,
            data: {
                userID: getCurrentUserId(getState()),
                callID: connectedCallID(getState()),
            },
        });
    };
}

export function receivedCall(call: Call, currentUserId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        try {
            await dispatch(getCallingChannel(call.channel_id));
            await dispatch(getUsersInCall(call.channel_id));
            await dispatch(getCallingUser(call.user_id));
            const globalState = getState();
            await replacePreviousAddedConference(dispatch, call, globalState);
            const {status} = callUserStatus(globalState);
            const channelType: ChannelType = callParameters(globalState).channel.type;
            if (channelType === 'O' || channelType === 'P' || status[currentUserId] === 'dnd' || call.user_id === currentUserId) {
                return;
            }

            dispatch({
                type: ActionTypes.CALL_RECEIVED,
                data: {
                    msg: call,
                },
            });

            if (isDesktopApp() && !isDesktopExtendedCallSupported() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.2.0')) {
                handleDesktopKmeetCall(globalState, call);
                return;
            }

            dispatch(openCallDialingModal(call.channel_id));
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[calls] receivedCall error:', error);
        }
    };
}

export function callNoLongerExist(endMsg: any) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const {msg} = callParameters(getState());
        if (msg?.url === endMsg.data.url) {
            stopRing();
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }
    };
}

export function joinCall(conferenceId: string, meetingUrl: string) {
    return async (dispatch: DispatchFunc) => {
        Client4.acceptIncomingMeetCall(conferenceId);
        const channelID = getCurrentChannelId(state);

        if (isDesktopApp()) {
            // si desktop app on rejoins bien sur la fenetre integrée.
            dispatch(startKmeetWindow(conferenceId, channelID));
            return;
        }

        const kmeetUrl = new URL(meetingUrl);
        window.open(kmeetUrl.href, '_blank', 'noopener');
    };
}

export function hangUpCall() {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conferenceId = callConferenceId(state);
        await Client4.declineIncomingMeetCall(conferenceId);
        // eslint-disable-next-line no-console
        console.log('[calls: hangUpCall]', conferenceId);
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        stopRing();
    };
}

export function startKmeetWindow(conferenceId: string, channelID: string) {
    return async (_: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const user = getCurrentUser(state);
        const avatar = Client4.getProfilePictureUrl(user.id, user.last_picture_update);
        const locale = getCurrentLocale(state);

        window.desktopAPI?.openKmeetCallWindow?.({avatar, user, channelID, conferenceId, locale});
    };
}

export function getUsersInCall(channelId: string) {
    return bindClientFunc({
        clientFunc: Client4.getProfilesInChannel,
        onSuccess: [ActionTypes.CALL_USERS_IN_CONF],
        params: [
            channelId,
        ],
    });
}

export function getCallingUser(userId: string) {
    return bindClientFunc({
        clientFunc: Client4.getProfilesByIds,
        onSuccess: [ActionTypes.CALL_CALLING_USER],
        params: [
            userId,
        ],
    });
}

export function getCallingChannel(channelId: string) {
    return bindClientFunc({
        clientFunc: Client4.getChannel,
        onSuccess: [ActionTypes.CALL_CONF_CHANNEL],
        params: [
            channelId,
        ],
    });
}

type Users = UserProfile & {avatar: string}

function setUsersAvatar(users: UserProfile[]): Users[] {
    return users.map((user: UserProfile) => ({
        ...user,
        avatar: imageURLForUser(user.id, user.last_picture_update),
    }));
}

export function handleDesktopKmeetCall(globalState: GlobalState, call: Call): void {
    const currentUser = getCurrentUser(globalState);
    const avatar = imageURLForUser(currentUser.id, currentUser?.last_picture_update);
    const {users, channel} = callParameters(globalState);
    const usersWithAvatars = setUsersAvatar(users);
    window.postMessage(
        {
            type: 'call-dialing',
            message: {
                calling: {
                    users: usersWithAvatars,
                    channelID: call.channel_id,
                    url: call.url,
                    name: channel.display_name,
                    avatar,
                    id: call.channel_id,
                    nicknames: users.map((usr) => usr.nickname).join(', '),
                    toneTimeOut: 30000,
                    conferenceId: call.id,
                },
            },
        },
        window.location.origin);
}

function replacePreviousAddedConference(dispatch: DispatchFunc, call: Call, globalState: GlobalState) {
    return dispatch({
        type: ActionTypes.VOICE_CHANNEL_ADDED,
        data: {
            channelID: call.channel_id,
            userID: getCurrentUserId(globalState),
            currentUserID: getCurrentUserId(globalState),
            url: call.url,
            id: call.id,
            call,
        },
    });
}

export function putChannelActiveConf(channelID: string, id: string, url: string) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: ActionTypes.VOICE_CHANNEL_PUT,
            data: {
                channelID,
                url,
                id,
            },
        });
    };
}

export function getMyMeets() {
    return bindClientFunc({
        clientFunc: Client4.getMeets,
        onSuccess: ActionTypes.VOICE_CHANNELS_RECEIVED,
    });
}
