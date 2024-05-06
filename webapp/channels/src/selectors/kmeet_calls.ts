// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from 'types/store';

export const connectedKmeetCallId = (state: GlobalState, channelID: string) => {
    return state.views.kmeetCalls.connectedKmeetUrls[channelID]?.id;
};

export const connectedKmeetCallUrl = (state: GlobalState, channelID: string) => {
    return state.views.kmeetCalls.connectedKmeetUrls[channelID]?.url;
};

export const connectedKmeetChannels = (state: GlobalState) => {
    return state.views.kmeetCalls.connectedKmeetUrls;
};

export const getConferenceByChannelId = (state: GlobalState, channelId: string) => {
    return state.views.kmeetCalls.conferences[channelId];
};

export const getIsAnyUserInConference = (state: GlobalState, channelId: string) => {
    const conference = state.views.kmeetCalls.conferences[channelId];

    if (!conference) {
        return false;
    }

    return Object.values(conference.registrants).some((registrant) => registrant.status === 'approved');
};

