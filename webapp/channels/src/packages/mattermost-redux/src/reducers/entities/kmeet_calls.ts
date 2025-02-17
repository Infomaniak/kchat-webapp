// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import type {AnyAction} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

// eslint-disable-next-line no-restricted-imports
import {ActionTypes} from 'utils/constants';

const conferences = (state: GlobalState['entities']['kmeetCalls']['conferences'] = {}, action: AnyAction) => {
    console.log('action', action);
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
            },
        };
    }
    case ActionTypes.VOICE_CHANNEL_DELETED:
        if (state[action.data.channelID]) {
            const nextState = {...state};
            delete nextState[action.data.channelID];
            return nextState;
        }
        return state;
    case ActionTypes.KMEET_CALL_USER_CONNECTED: {
        if (!Reflect.has(state, action.data.channelId)) {
            return state;
        }

        return {
            ...state,
            [action.data.channelId]: {
                ...state[action.data.channelId],
                registrants: {
                    ...state[action.data.channelId].registrants,
                    [action.data.userId]: {
                        ...state[action.data.channelId].registrants[action.data.userId],
                        status: 'approved',
                        present: true,
                    },
                },
            },
        };
    }
    case ActionTypes.KMEET_CALL_USER_DISCONNECTED: {
        if (!Reflect.has(state, action.data.channelId)) {
            return state;
        }

        return {
            ...state,
            [action.data.channelId]: {
                ...state[action.data.channelId],
                registrants: {
                    ...state[action.data.channelId].registrants,
                    [action.data.userId]: {
                        ...state[action.data.channelId].registrants[action.data.userId],
                        present: false,
                    },
                },
            },
        };
    }
    case ActionTypes.KMEET_CALL_USER_DENIED: {
        if (!Reflect.has(state, action.data.channelId)) {
            return state;
        }

        return {
            ...state,
            [action.data.channelId]: {
                ...state[action.data.channelId],
                registrants: {
                    ...state[action.data.channelId].registrants,
                    [action.data.userId]: {
                        ...state[action.data.channelId].registrants[action.data.userId],
                        status: 'denied',
                    },
                },
            },
        };
    }
    default:
        return state;
    }
};

export default combineReducers({
    conferences,
});
