// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import type {DispatchFunc} from 'mattermost-redux/types/actions';

import {getCurrentLocale} from 'selectors/i18n';
import {getConferenceByChannelId, getIsUserInConference, getTotalJoinedUserInConference} from 'selectors/kmeet_calls';

import {ActionTypes, ModalIdentifiers} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';

import type {GlobalState} from 'types/store';

import {closeModal} from './views/modals';

export function openRingingModal(channelId: string) {
    window.open(`${window.location.origin}/kmeet/calls/${channelId}/modal`, '_blank', 'top=500,left=200,frame=false,nodeIntegration=no');
}

export function externalJoinCall(msg: any) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conference = getConferenceByChannelId(state, msg.data.channel_id);
        const currentUserId = getCurrentUserId(state);
        const isUserInConference = getIsUserInConference(state, msg.data.channel_id, msg.data.user_id);
        const totalJoinedUserInConference = getTotalJoinedUserInConference(state, msg.data.channel_id);

        if (!conference || isUserInConference) {
            return;
        }

        if (conference.user_id === currentUserId && totalJoinedUserInConference === 0 && msg.data.user_id !== currentUserId) {
            if (isDesktopApp()) {
                dispatch(startKmeetWindow(msg.data.channel_id));
            } else {
                dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
                window.open(conference.url, '_blank', 'noopener');
            }
        }

        dispatch({
            type: ActionTypes.KMEET_CALL_USER_CONNECTED,
            data: {
                channelId: msg.data.channel_id,
                connectedUserId: msg.data.user_id,
            },
        });
    };
}

export function joinCall(channelId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const conference = getConferenceByChannelId(getState(), channelId);
        await Client4.acceptIncomingMeetCall(conference.id);

        if (isDesktopApp()) {
            dispatch(startKmeetWindow(channelId));
            return;
        }

        window.open(conference.url, '_blank', 'noopener');
    };
}

export function declineCall(conferenceId: string) {
    return async (dispatch: DispatchFunc) => {
        await Client4.declineIncomingMeetCall(conferenceId);
        console.log('[calls: hangUpCall]', conferenceId);

        if (isDesktopApp()) {
            window.desktopAPI?.closeRingCallWindow?.();
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }
    };
}

export function leaveCall(channelId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conference = getConferenceByChannelId(state, channelId);
        const currentUserId = getCurrentUserId(getState());

        await Client4.leaveMeet(conference.id);

        if (isDesktopApp()) {
            window.desktopAPI?.closeRingCallWindow?.();
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }

        dispatch({
            type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
            data: {
                channelID: conference.channel_id,
                userID: currentUserId,
                currentUserID: currentUserId,
                callID: conference.id,
            },
        });

        return {data: true};
    };
}

export function startKmeetWindow(channelId: string) {
    return async (_: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const user = getCurrentUser(state);
        const conference = getConferenceByChannelId(state, channelId);
        const avatar = Client4.getProfilePictureUrl(user.id, user.last_picture_update);
        const locale = getCurrentLocale(state);

        window.desktopAPI?.openKmeetCallWindow?.({avatar, user, channelID: conference.channel_id, conferenceId: conference.id, locale});
    };
}
