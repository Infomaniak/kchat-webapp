// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Dispatch} from 'redux';

import {ActionFunc, DispatchFunc, GenericAction} from 'mattermost-redux/types/actions';
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

import {isKmeetCallCompatibleDesktopApp} from 'utils/user_agent';

import {imageURLForUser} from 'utils/utils';

import {PostTypes} from 'mattermost-redux/constants/posts';
import {bindClientFunc} from 'mattermost-redux/actions/helpers';

import {ringing, stopRing} from 'utils/notification_sounds';

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
    return async (dispatch: DispatchFunc, getState) => {
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

export function joinCallInChannel(): ActionFunc {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const {msg} = callParameters(getState());
        const conferenceId = callConferenceId(state);
        Client4.acceptIncomingMeetCall(conferenceId);
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        stopRing();
        if (msg) {
            const kmeetUrl = new URL(msg.props.url);
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
            const {status} = callUserStatus(getState());

            if (callMessage.type === PostTypes.CALL && !callMessage.props.ended_at && callMessage.user_id !== currentUserId) {
                dispatch(getCallingChannel(callMessage));
                dispatch(getUsersInCall(callMessage));
                dispatch(getCallingUser(callMessage));
                dispatch({
                    type: ActionTypes.CALL_RECEIVED,
                    data: {
                        msg: callMessage,
                    },
                });
                const {users, caller, channel} = callParameters(getState());
                const currentUser = getCurrentUser(getState());
                const avatar = imageURLForUser(currentUserId, currentUser?.last_picture_update);
                if (isKmeetCallCompatibleDesktopApp()) {
                    window.postMessage(
                        {
                            type: 'call-dialing',
                            message: {
                                calling: {
                                    users,
                                    channelID: callMessage.channel_id,
                                    userCalling: caller.id,
                                    channel,
                                    url: callMessage.props.url,
                                    name: channel.display_name,
                                    username: currentUser.nickname,
                                    avatar,
                                    id: callMessage.channel_id,
                                    nicknames: users.map((usr) => usr.nickname).join(', '),
                                    caller,
                                    currentUser,
                                },
                            },
                        },
                        window.location.origin);
                } else {
                    if (status[currentUserId] !== 'dnd') {
                        ringing('Ring');
                    }
                    dispatch(openModal(
                        {
                            modalId: ModalIdentifiers.INCOMING_CALL,
                            dialogType: DialingModal,
                        },
                    ));
                }
            }
        } catch (error) {
            return {error};
        }
    };
}
export function callNoLongerExist(endMsg): ActionFunc {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const {msg} = callParameters(getState());
        if (msg.props.url === endMsg.data.url) {
            stopRing();
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }
    };
}
export function hangUpCall(): ActionFunc {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conferenceId = callConferenceId(state);
        Client4.declineIncomingMeetCall(conferenceId);
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        stopRing();
        dispatch({
            type: ActionTypes.CALL_HANGUP,
            data: {isRinging: false},
        });
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
