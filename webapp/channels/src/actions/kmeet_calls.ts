// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import type {DispatchFunc} from 'mattermost-redux/types/actions';

import {getCurrentLocale} from 'selectors/i18n';
import {getConferenceByChannelId} from 'selectors/kmeet_calls';

import {ActionTypes} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';

import type {GlobalState} from 'types/store';

export function openRingingModal(channelId: string) {
    window.open(`${window.location.origin}/kmeet/calls/${channelId}/modal`, '_blank', 'top=500,left=200,frame=false,nodeIntegration=no');
}

export function joinCall(channelId: string) {
    return async (dispatch: DispatchFunc, state: GlobalState) => {
        Client4.acceptIncomingMeetCall(channelId);

        if (isDesktopApp()) {
            dispatch(startKmeetWindow(channelId));
            return;
        }

        const conference = getConferenceByChannelId(state, channelId);
        window.open(conference.url, '_blank', 'noopener');
    };
}

export function declineCall(conferenceId: string) {
    return async () => {
        Client4.declineIncomingMeetCall(conferenceId);

        if (isDesktopApp()) {
            window.desktopAPI?.closeRingCallWindow?.();
        }
    };
}

export function leaveCall(channelId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conference = getConferenceByChannelId(state, channelId);
        const currentUserId = getCurrentUserId(getState());

        await Client4.leaveMeet(conference.id);

        dispatch({
            type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
            data: {
                channelID: conference.channel_id,
                userID: currentUserId,
                currentUserID: currentUserId,
                callID: conference.id,
            },
        });

        if (isDesktopApp()) {
            window.desktopAPI?.closeRingCallWindow?.();
        }

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
