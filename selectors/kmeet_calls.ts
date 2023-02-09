// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GlobalState} from 'types/store';
export const connectedKmeetCallUrl = (state: GlobalState, channelID: string) => {
    return state.views.kmeetCalls.connectedKmeetUrls[channelID]?.url;
};

export const connectedKmeetChannels = (state: GlobalState) => {
    return state.views.kmeetCalls.connectedKmeetUrls;
};
