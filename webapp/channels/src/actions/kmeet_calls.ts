// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getUserById} from 'mattermost-redux/selectors/entities/users';
import type {DispatchFunc} from 'mattermost-redux/types/actions';

import {getCurrentLocale} from 'selectors/i18n';
import {getConferenceByChannelId, getIsUserInConference} from 'selectors/kmeet_calls';
import {isModalOpen} from 'selectors/views/modals';

import {ActionTypes, ModalIdentifiers} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';

import type {GlobalState} from 'types/store';

import {closeModal} from './views/modals';

export function openCallDialingModal(channelId: string) {
    return async (_: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conference = getConferenceByChannelId(state, channelId);
        const currentUser = getCurrentUser(state);
        const caller = getUserById(state, conference.user_id);
        const users = conference.participants.map((id: string) => getUserById(state, id));

        window.desktopAPI?.openCallDialing?.({
            conference,
            currentUser,
            caller,
            users,
            channelId,
        });
    };
}

export function externalJoinCall(msg: any) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conference = getConferenceByChannelId(state, msg.data.channel_id);
        const currentUserId = getCurrentUserId(state);
        const isUserInConference = getIsUserInConference(state, msg.data.channel_id, msg.data.user_id);
        const isModalOpen = isRingingModalOpen(state);

        if (!conference || isUserInConference) {
            return;
        }

        if (conference.user_id === currentUserId && msg.data.user_id !== currentUserId && isModalOpen) {
            dispatch(joinCall(msg.data.channel_id));
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
        const answer = await Client4.acceptIncomingMeetCall(conference.id);
        dispatch(startCall(channelId, answer.jwt, conference.url));
    };
}

export function declineCall(conferenceId: string) {
    return async (dispatch: DispatchFunc) => {
        await Client4.declineIncomingMeetCall(conferenceId);

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

export function startCall(channelId: string, jwt: string, url: string) {
    return async (dispatch: DispatchFunc) => {
        if (isDesktopApp()) {
            dispatch(startKmeetWindow(channelId, jwt));
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
            window.open(url + `jwt=${jwt}`, '_blank', 'noopener');
        }
    };
}

export function startKmeetWindow(channelId: string, jwt: string) {
    return async (_: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const user = getCurrentUser(state);
        const conference = getConferenceByChannelId(state, channelId);
        const avatar = Client4.getProfilePictureUrl(user.id, user.last_picture_update);
        const locale = getCurrentLocale(state);

        window.desktopAPI?.openKmeetCallWindow?.({avatar, user, channelID: conference.channel_id, conferenceId: conference.id, locale, jwt});
    };
}

export const isRingingModalOpen = (state: GlobalState) => {
    return isDesktopApp() ? Boolean(window.desktopAPI?.isRingCallWindowOpen?.()) : isModalOpen(state, ModalIdentifiers.INCOMING_CALL);
};

export const closeRingModal = () => {
    return async (dispatch: DispatchFunc) => {
        if (isDesktopApp()) {
            window.desktopAPI?.closeRingCallWindow?.();
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }
    };
};
