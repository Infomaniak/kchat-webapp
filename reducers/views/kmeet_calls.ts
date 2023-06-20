// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {PostTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants';
const connectedKmeetUrls = (state: ConnectedKmeetUrlsState = {},
    action: {type: string;
        data: {type: string;props: {url: string; conference_id: string; created_at: number}; channelID: string; url: string; id: string};}) => {
    switch (action.type) {
    case PostTypes.RECEIVED_NEW_POST:
        if (action.data.type === 'custom_call') {
            console.log(action.data);
            return {
                ...state,
                [action.data.channelID]: {

                    url: action.data.props.url,
                    // url: 'https://kmeet.infomaniak.com' + action.data.props.conference_id,
                    id: action.data.props.conference_id,
                }};
        }
        return state;
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
