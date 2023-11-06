// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Dispatch} from 'redux';

import type {ChannelType} from '@mattermost/types/channels';
import type {Call} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {bindClientFunc} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import type {DispatchFunc, GenericAction} from 'mattermost-redux/types/actions';

import {
    callConferenceId,
    callParameters,
    callUserStatus,
    connectedCallID,
    connectedCallUrl,
    connectedChannelID,
    voiceConnectedChannels,
} from 'selectors/calls';
import {connectedKmeetCallUrl} from 'selectors/kmeet_calls';
import {isModalOpen} from 'selectors/views/modals';

import DialingModal from 'components/kmeet_conference/ringing_dialog';

import {ActionTypes, ModalIdentifiers} from 'utils/constants';
import {ringing, stopRing} from 'utils/notification_sounds';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';
import {imageURLForUser} from 'utils/utils';

import type {GlobalState} from 'types/store';

import {closeModal, openModal} from './views/modals';

export const showExpandedView = () => (dispatch: Dispatch<GenericAction>) => {
    dispatch({
        type: ActionTypes.SHOW_EXPANDED_VIEW,
    });
};

export const hideExpandedView = () => (dispatch: Dispatch<GenericAction>) => {
    dispatch({
        type: ActionTypes.HIDE_EXPANDED_VIEW,
    });
};

export const showSwitchCallModal = (targetID?: string) => (dispatch: Dispatch<GenericAction>) => {
    dispatch({
        type: ActionTypes.SHOW_SWITCH_CALL_MODAL,
        data: {
            targetID,
        },
    });
};

export const hideSwitchCallModal = () => (dispatch: Dispatch<GenericAction>) => {
    dispatch({
        type: ActionTypes.HIDE_SWITCH_CALL_MODAL,
    });
};

export function leaveCallInChannel(channelID: string, dialingID: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
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
    };
}

//used only to answer last call brought by the dialing modal
export function joinCallInChannel() {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conferenceId = callConferenceId(state);
        await Client4.acceptIncomingMeetCall(conferenceId);
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        const {msg} = callParameters(state);
        stopRing();
        setTimeout(() => {
            if (msg) {
                const kmeetUrl = new URL(msg.url);
                console.log('[calls: joinCallInChannel]', msg.url);
                window.open(kmeetUrl.href, '_blank', 'noopener');
            }
        });
    };
}

// old simplified code for calls that just opens the link and fills store with the url.
// only used if FeatureFlagIkCallDialing is set to false.
export function startOrJoinCallInChannel(channelID: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
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
    };
}

//used to manage action from postType actions and meet button
export function startOrJoinCallInChannelV2(channelID: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        try {
            let kmeetUrl;
            const data = await Client4.startMeet(channelID);
            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });

            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ADDED,
                data: {
                    channelID,
                    userID: getCurrentUserId(getState()),
                    currentUserID: getCurrentUserId(getState()),
                    url: data?.url,
                    id: data?.id,
                },
            });

            if (data && data.url) {
                kmeetUrl = new URL(data.url);
            }

            if (kmeetUrl) {
                console.log('[calls: startOrJoinKmeetCallInChannelV2] window.open', kmeetUrl.href);
                window.open(kmeetUrl.href, '_blank', 'noopener');
            }
        } catch {
            const url = connectedKmeetCallUrl(getState(), channelID);
            if (url) {
                window.open(url, '_blank', 'noopener');
            }
            console.log(`[calls]: Call user back. connected url: ${url}`);
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

            if (isDesktopApp()) {
                if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.2.0')) {
                    console.log('[calls] call received on desktop.');
                    handleDesktopKmeetCall(globalState, currentUserId, call);

                    return;
                }
                console.warn(`[calls] dialing on desktop is supported from version 2.2 and up, current version is ${getDesktopVersion()}`);
                const kmeetUrl = new URL(call.url);
                window.open(kmeetUrl.href, '_blank', 'noopener');

                return;
            }

            console.log('[calls] call received on browser.');
            if (isModalOpen(getState(), ModalIdentifiers.INCOMING_CALL)) {
                return;
            }
            ringing('Ring');
            dispatch(openModal(
                {
                    modalId: ModalIdentifiers.INCOMING_CALL,
                    dialogType: DialingModal,
                    dialogProps: {
                        toneTimeOut: 30000,
                    },
                },
            ));
        } catch (error) {
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
export function hangUpCall() {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conferenceId = callConferenceId(state);
        await Client4.declineIncomingMeetCall(conferenceId);
        console.log('[calls: hangUpCall]', conferenceId);
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        stopRing();
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
export function setCallListeners() {
    if (isDesktopApp() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.2.0')) {
        (window as any).callManager?.onCallJoined((_: any, props: { conferenceId: string }) => {
            return Client4.acceptIncomingMeetCall(props.conferenceId);
        });

        (window as any).callManager?.onCallDeclined((_: any, props: { conferenceId: string }) => {
            return Client4.declineIncomingMeetCall(props.conferenceId);
        });
    }
}

type Users = UserProfile & {avatar: string}

function setUsersAvatar(users: UserProfile[]): Users[] {
    return users.map((user: UserProfile) => ({
        ...user,
        avatar: imageURLForUser(user.id, user.last_picture_update),
    }));
}

function handleDesktopKmeetCall(globalState: GlobalState, currentUserId: string, call: Call): void {
    const currentUser = getCurrentUser(globalState);
    const avatar = imageURLForUser(currentUserId, currentUser?.last_picture_update);
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
        },
    });
}
