// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */
import {Dispatch} from 'redux';

import {DispatchFunc, GenericAction} from 'mattermost-redux/types/actions';
import {ActionTypes, ModalIdentifiers} from 'utils/constants';
import {
    callConferenceId,
    callParameters,
    callUserStatus,
    connectedCallID,
} from 'selectors/calls';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {Client4} from 'mattermost-redux/client';
import {GlobalState} from 'types/store';
import {Post} from '@mattermost/types/posts';

import DialingModal from 'components/kmeet_conference/ringing_dialog';

import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';

import {imageURLForUser} from 'utils/utils';

import {PostTypes} from 'mattermost-redux/constants/posts';
import {bindClientFunc} from 'mattermost-redux/actions/helpers';

import {ringing, stopRing} from 'utils/notification_sounds';

import {ChannelType} from '@mattermost/types/channels';

import {connectedKmeetChannels, connectedKmeetCallUrl} from 'selectors/kmeet_calls';

import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';

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
                const kmeetUrl = new URL(msg.props.url);
                console.log('[calls: joinCallInChannel]', msg.props.url);
                window.open(kmeetUrl.href, '_blank', 'noopener');
            }
        });
    };
}

//used to manage action from postType actions and meet button
export function startOrJoinKmeetCallInChannel(channelID: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const channels = Object.keys(connectedKmeetChannels(state));

        let data;
        let kmeetUrl;
        if (channels.indexOf(channelID) === -1) {
            data = await Client4.startMeet(channelID);

            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });

            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ADDED,
                data: {
                    channelID,
                    userID: getCurrentUserId(getState()),
                    currentUserID: getCurrentUserId(getState()),
                    url: data.url,
                    id: data.id,
                },
            });

            if (data && data.url) {
                kmeetUrl = new URL(data.url);
            }
        } else if (connectedKmeetCallUrl(state, channelID) !== null) {
            kmeetUrl = new URL(connectedKmeetCallUrl(state, channelID));
        }

        if (kmeetUrl) {
            console.log('[calls: startOrJoinKmeetCallInChannel] window.open', kmeetUrl.href);
            window.open(kmeetUrl.href, '_blank', 'noopener');
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

export function receivedCall(callMessage: Post, currentUserId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        try {
            if (callMessage.type === PostTypes.CALL && !callMessage.props.ended_at) {
                const globalState = getState();
                dispatch(getCallingChannel(callMessage));
                dispatch(getUsersInCall(callMessage));
                dispatch(getCallingUser(callMessage));
                replacePreviousAddedConference(dispatch, callMessage, globalState);
                const {status} = callUserStatus(globalState);
                const channelType: ChannelType = callParameters(globalState).channel.type;
                if (channelType === 'O' || channelType === 'P' || status[currentUserId] === 'dnd' || callMessage.props.in_call || callMessage.user_id === currentUserId) {
                    return;
                }

                dispatch({
                    type: ActionTypes.CALL_RECEIVED,
                    data: {
                        msg: callMessage,
                    },
                });

                if (isDesktopApp()) {
                    if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.3.0')) {
                        console.log('[calls] call received on desktop.');
                        handleDesktopKmeetCall(globalState, currentUserId, callMessage);

                        return;
                    }
                    console.warn(`[calls] dialing on desktop is supported from version 2.3 and up, current version is ${getDesktopVersion()}`);
                    const kmeetUrl = new URL(callMessage.props.url);
                    window.open(kmeetUrl.href, '_blank', 'noopener');

                    return;
                }

                console.log('[calls] call received on browser.');
                launchRingAction(dispatch);
            }
        } catch (error) {
            console.error('[calls] receivedCall error:', error);
        }
    };
}

export function callNoLongerExist(endMsg: any) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const {msg} = callParameters(getState());
        if (msg.props?.url === endMsg.data.url) {
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

export function getUsersInCall(callMessage: Post) {
    return bindClientFunc({
        clientFunc: Client4.getProfilesInChannel,
        onSuccess: [ActionTypes.CALL_USERS_IN_CONF],
        params: [
            callMessage.channel_id,
        ],
    });
}

export function getCallingUser(callMessage: Post) {
    return bindClientFunc({
        clientFunc: Client4.getProfilesByIds,
        onSuccess: [ActionTypes.CALL_CALLING_USER],
        params: [
            callMessage.user_id,
        ],
    });
}

export function getCallingChannel(callMessage: Post) {
    return bindClientFunc({
        clientFunc: Client4.getChannel,
        onSuccess: [ActionTypes.CALL_CONF_CHANNEL],
        params: [
            callMessage.channel_id,
        ],
    });
}
export function setCallListeners() {
    if (isDesktopApp() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.3.0')) {
        (window as any).callManager?.onCallJoined((_: any, props: { conferenceId: string }) => {
            return Client4.acceptIncomingMeetCall(props.conferenceId);
        });

        (window as any).callManager?.onCallDeclined((_: any, props: { conferenceId: string }) => {
            return Client4.declineIncomingMeetCall(props.conferenceId);
        });
    }
}

function launchRingAction(dispatch: DispatchFunc): void {
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
}
function handleDesktopKmeetCall(globalState: GlobalState, currentUserId: string, callMessage: Post): void {
    const currentUser = getCurrentUser(globalState);
    const avatar = imageURLForUser(currentUserId, currentUser?.last_picture_update);
    const {users, channel} = callParameters(globalState);
    window.postMessage(
        {
            type: 'call-dialing',
            message: {
                calling: {
                    users,
                    channelID: callMessage.channel_id,
                    url: callMessage.props.url,
                    name: channel.display_name,
                    avatar,
                    id: callMessage.channel_id,
                    nicknames: users.map((usr) => usr.nickname).join(', '),
                    conferenceId: callMessage.props.conference_id,
                    toneTimeOut: 30000,
                },
            },
        },
        window.location.origin);
}

function replacePreviousAddedConference(dispatch: DispatchFunc, callMessage: Post, globalState: GlobalState): void {
    dispatch({
        type: ActionTypes.VOICE_CHANNEL_ADDED,
        data: {
            channelID: callMessage.channel_id,
            userID: getCurrentUserId(globalState),
            currentUserID: getCurrentUserId(globalState),
            url: callMessage.props.url,
            id: callMessage.props.conference_id,
        },
    });
}
