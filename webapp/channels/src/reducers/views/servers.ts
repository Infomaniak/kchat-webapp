// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import type {GenericAction} from 'mattermost-redux/types/actions';

import {Servers, ServerStatus, ServerDefaultBadgeValue} from 'utils/constants';

import type {Server} from 'types/store/servers';
import type {ViewsState} from 'types/store/views';

export const servers = (state: ViewsState['servers']['servers'] = {}, action: GenericAction) => {
    switch (action.type) {
    case Servers.RECEIVED_SERVERS: {
        return action.data.reduce((acc: object, next: Server) => ({...acc, [next.id]: next}), {});
    }
    case Servers.BADGE_UPDATED: {
        const server = state[action.data.serverId];

        return {
            ...state,
            [action.data.serverId]: {
                ...server,
                badges: action.data.badges,
            },
        };
    }
    case Servers.RECEIVED_SERVER_DELETED: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.id);
        return nextState;
    }
    case Servers.RECEIVED_SERVER_ADDED: {
        return {
            ...state,
            [action.data.server.id]: {
                ...action.data.server,
                badges: ServerDefaultBadgeValue,
                user_id: action.data.userId,
                status: ServerStatus.OK,
            },
        };
    }
    case Servers.STATUS_UPDATED: {
        const server = state[action.data.serverId];

        return {
            ...state,
            [action.data.serverId]: {
                ...server,
                status: action.data.status,
            },
        };
    }
    default:
        return state;
    }
};

export default combineReducers({
    servers,
});
