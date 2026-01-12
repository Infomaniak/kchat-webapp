// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import type {GlobalState} from 'types/store';

export const getConferenceByChannelId = (state: GlobalState, channelId?: string) => {
    if (!channelId) {
        return null;
    }
    return state.views.kmeetCalls.conferences[channelId];
};

export const getIsAnyUserInConference = (state: GlobalState, channelId: string) => {
    const conference = state.views.kmeetCalls.conferences[channelId];

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
        const conferences = Object.values(state.views.kmeetCalls.conferences);

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

