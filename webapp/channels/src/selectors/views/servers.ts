// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import type {BasicUnreadStatus} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import type {GlobalState} from 'types/store';
import type {Server} from 'types/store/servers';

export function getServers(state: GlobalState) {
    return state.views.servers.servers;
}

export function getArrayServers(state: GlobalState) {
    return Object.values(state.views.servers.servers);
}

export function getServerById(state: GlobalState, serverId: string) {
    return state.views.servers.servers[serverId];
}

export const getCurrentServer: (state: GlobalState) => Server = createSelector(
    'makeGetBadgeCountForServerId',
    getServers,
    getCurrentTeamId,
    (servers, currentServerId) => {
        return servers[currentServerId];
    },
);

export const getOtherServers: (state: GlobalState) => Server[] = createSelector(
    'makeGetBadgeCountForServerId',
    getArrayServers,
    getCurrentTeamId,
    (servers, currentServerId) => {
        return servers.filter((server) => server.id !== currentServerId);
    },
);

export const makeGetBadgeCountForServerId: (state: GlobalState, id: string) => number = createSelector(
    'makeGetBadgeCountForServerId',
    getServers,
    (state: GlobalState, id: string) => id,
    (servers, serverId) => {
        const server = servers[serverId];

        if (!server) {
            return 0;
        }

        return Number(server.badges);
    },
);

export const getServersUnreadStatus: (state: GlobalState) => BasicUnreadStatus = createSelector(
    'getUnreadStatus',
    getServers,
    getCurrentTeamId,
    (
        servers,
        currentTeamId,
    ) => {
        let total = 0;

        for (const serverId of Object.keys(servers)) {
            if (serverId === currentTeamId || !(serverId in servers)) {
                continue;
            }

            total += servers[serverId].badges;
        }

        return Boolean(total);
    },
);

export const isMultiServer: (state: GlobalState) => boolean = createSelector(
    'isMultiServer',
    getOtherServers,
    (
        servers,
    ) => {
        return Boolean(servers.length);
    },
);
