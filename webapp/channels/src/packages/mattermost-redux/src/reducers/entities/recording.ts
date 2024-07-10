import type {AnyAction} from 'redux';

import type{Recording} from '@mattermost/types/recording';

import {WebsocketEvents} from 'mattermost-redux/constants';

export default function recording(state: Recording = {}, action: AnyAction): Recording {
    const {
        data,
        type,
    } = action;

    switch (type) {
    case WebsocketEvents.RECORDING: {
        const {
            id,
            userId,
            now,
        } = data;

        if (id && userId) {
            return {
                ...state,
                [id]: {
                    ...(state[id] || {}),
                    [userId]: now,
                },
            };
        }

        return state;
    }
    case WebsocketEvents.STOP_RECORDING: {
        const {
            id,
            userId,
            now,
        } = data;

        if (state[id] && state[id][userId] <= now) {
            const nextState: Recording = {
                ...state,
                [id]: {...state[id]},
            };

            Reflect.deleteProperty(nextState[id], userId);

            if (Object.keys(nextState[id]).length === 0) {
                Reflect.deleteProperty(nextState, id);
            }

            return nextState;
        }

        return state;
    }

    default:
        return state;
    }
}
