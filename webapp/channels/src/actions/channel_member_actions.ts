// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannelMembersByIds} from 'mattermost-redux/actions/channels';
import {getUser as loadUser} from 'mattermost-redux/actions/users';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {fetchChannelGroups} from 'actions/ik_channel_groups';
import {loadStatusesByIds} from 'actions/status_actions';

import type {ActionFuncAsync} from 'types/store';

export function loadNewChannelMember(userId: string, channelId?: string): ActionFuncAsync {
    return async (doDispatch, doGetState) => {
        const newChannelId = channelId || getCurrentChannelId(doGetState());

        if (!newChannelId) {
            return {error: true};
        }

        await Promise.all([
            doDispatch(loadUser(userId)),
            doDispatch(getChannelMembersByIds(newChannelId, [userId])),
            doDispatch(loadStatusesByIds([userId])),
            doDispatch(fetchChannelGroups(newChannelId)),
        ]);

        return {data: true};
    };
}

export function unloadChannelMember(userId: string, channelId: string): ActionFuncAsync {
    return async (doDispatch) => {
        await doDispatch(fetchChannelGroups(channelId));
        return {data: true};
    };
}
