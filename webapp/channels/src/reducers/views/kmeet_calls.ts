// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import type {AnyAction} from 'redux';

import {PostTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants';

import type {ViewsState} from 'types/store/views';

const connectedKmeetUrls = (state: ViewsState['kmeetCalls']['connectedKmeetUrls'] = {}, action: AnyAction) => {
    switch (action.type) {
    case PostTypes.RECEIVED_NEW_POST:
        if (action.data.type && action.data.type === 'custom_call') {
            return {
                ...state,
                [action.data.channel_id]: {
                    url: action.data.props.url,
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
    case ActionTypes.VOICE_CHANNEL_PUT:
        return {
            ...state,
            [action.data.channelID]: {
                url: action.data.url,
                id: action.data.id,
            },
        };
    case ActionTypes.VOICE_CHANNELS_RECEIVED: {
        const nextState = {};

        for (const call of action.data) {
            Reflect.set(nextState, call.channel_id, {id: call.id, url: call.url});
        }

        return nextState;
    }
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

const conferences = (state: ViewsState['kmeetCalls']['conferences'] = {}, action: AnyAction) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNELS_RECEIVED: {
        const nextState = {};

        for (const call of action.data) {
            Reflect.set(nextState, call.channel_id, {...call, participants: []});
        }

        return nextState;
    }
    case ActionTypes.CALL_RECEIVED: {
        const nextState = {...state};
        const call = action.data.msg;

        Reflect.set(nextState, call.channel_id, call);
        return nextState;
    }
    case ActionTypes.VOICE_CHANNEL_ADDED: {
        return {
            ...state,
            [action.data.call.channel_id]: {
                ...action.data.call,
                participants: [],
            },
        };
    }
    case ActionTypes.VOICE_CHANNEL_DELETED:
        if (state[action.data.channelID]) {
            const filteredCalls = Object.entries(state).filter(([key]) => key !== action.data.channelID);
            return filteredCalls.length > 0 ? Object.fromEntries(filteredCalls) : {};
        }
        return state;
    case ActionTypes.KMEET_CALL_USER_CONNECTED: {
        const nextState = {...state};
        const conference = Reflect.get(nextState, action.data.channelId);
        const newSet = new Set([action.data.connectedUserId, ...(conference.participants || [])]);
        const participants = Array.from(newSet);

        Reflect.set(nextState, action.data.channelId, {...conference, participants});

        return nextState;
    }
    default:
        return state;
    }
};

export default combineReducers({
    connectedKmeetUrls,
    conferences,
});
