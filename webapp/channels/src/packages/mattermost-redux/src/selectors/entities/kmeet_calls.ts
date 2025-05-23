// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from '@mattermost/types/store';

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

export const getConferenceByChannelId = (state: GlobalState, channelId?: string) => {
    if (!channelId) {
        return null;
    }
    return state.entities.kmeetCalls.conferences[channelId];
};

export const getIsAnyUserInConference = (state: GlobalState, channelId: string) => {
    const conference = state.entities.kmeetCalls.conferences[channelId];

    if (!conference) {
        return false;
    }

    return Object.values(conference.registrants).some((registrant) => registrant.status === 'approved');
};

export const getIsCurrentUserInCall = createSelector(
    'getIsCurrentUserInCall',
    (state: GlobalState) => state, getCurrentUserId,
    (state, currentUserId) => {
        let inCall = false;
        const conferences = Object.values(state.entities.kmeetCalls.conferences);

        for (const conference of conferences) {
            if (conference) {
                if (Boolean(conference.registrants[currentUserId]?.present) === true) {
                    inCall = true;
                    break;
                }
            }
        }

        return inCall;
    },
);

export const getConferenceParticipantsIds = createSelector(
    'getConferenceParticipants',
    (state: GlobalState, channelId: string) => getConferenceByChannelId(state, channelId),
    getCurrentUser,
    (conference, currentUser): string[] => {
        if (!conference?.registrants) {
            return [];
        }

        const ids = Object.keys(conference.registrants);
        return currentUser ? ids.filter((id) => id !== currentUser.id) : ids;
    },
);

