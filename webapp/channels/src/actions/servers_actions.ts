// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import store from 'stores/redux_store';

import {SocketEvents} from 'utils/constants';

import {changeStatus, setBadges} from './views/servers';

const dispatch = store.dispatch;

type ServerMessage<T> = {
    event: string;
    serverId: string;
    data: T;
}

export function handleServerEvent(msg: ServerMessage<any>) {
    switch (msg.event) {
    case SocketEvents.BADGE_UPDATED:
        handleBadgeUpdated(msg);
        break;
    case SocketEvents.TEAM_STATUS_CHANGED:
        handleChangeStatus(msg);
        break;
    }
}

export const handleBadgeUpdated = (msgProps: ServerMessage<{ badge: number }>) => {
    dispatch(setBadges(msgProps.serverId, msgProps.data.badge));
};

export const handleChangeStatus = (msgProps: ServerMessage<{ status: string }>) => {
    dispatch(changeStatus(msgProps.serverId, msgProps.data.status));
};

