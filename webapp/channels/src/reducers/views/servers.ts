// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {TeamTypes} from 'mattermost-redux/action_types';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {Servers, ServerStatus, ServerDefaultBadgeValue} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';

import WebClient from 'client/web_websocket_client';

import type {Server} from 'types/store/servers';
import type {ViewsState} from 'types/store/views';

export const servers = (state: ViewsState['servers']['servers'] = {}, action: GenericAction) => {
    if (isDesktopApp()) {
        return state;
    }

    switch (action.type) {
    case Servers.RECEIVED_SERVERS: {
        WebClient.setOthersTeams(action.data.map((o: Server) => ({userId: o.user_id, teamId: o.id})));
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
    case TeamTypes.RECEIVED_TEAM: {
        const nextState = {...state};
        Reflect.set(nextState, action.data.id, {...action.data, badges: ServerDefaultBadgeValue, user_id: action.userId, status: ServerStatus.OK});
        WebClient.addNewTeam(action.userId, action.data.id, action.currentTeamId);
        return nextState;
    }
    case TeamTypes.RECEIVED_TEAM_DELETED: {
        if (action.data.currentTeamId !== action.data.id) {
            const nextState = {...state};
            Reflect.deleteProperty(nextState, action.data.id);
            WebClient.removeTeam(action.data.id);
            return nextState;
        }

        return state;
    }
    default:
        return state;
    }
};

export default combineReducers({
    servers,
});
