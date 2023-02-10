// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {ActionTypes} from 'utils/constants';

const connectedKmeetUrls = (state: ConnectedKmeetUrlsState = {}, action: {type: string; data: {channelID: string; url: string; id: string}}) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_USERS_CONNECTED:
        return {
            ...state,
            [action.data.channelID]: {
                url: action.data.url,
                id: action.data.id,
            },
        };
    case ActionTypes.VOICE_CHANNEL_ADDED:
        return {
            ...state,
            [action.data.channelID]: {
                url: action.data.url,
                id: action.data.id,
            },
        };
    case ActionTypes.VOICE_CHANNEL_DELETED:
        if (state[action.data.channelID]) {
            const filteredCalls = Object.entries(state).filter(([key]) => key !== action.data.channelID);
            return filteredCalls.length > 0 ? Object.fromEntries(filteredCalls) : {};
        }
        return state;
    default:
        return state;
    }
};

interface ConnectedKmeetUrlsState {
    [channelID: string]: {
        url: string;
        id: string;
    };
}

export default combineReducers({
    connectedKmeetUrls,
});
