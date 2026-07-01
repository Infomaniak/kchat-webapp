// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Channel} from '@mattermost/types/channels';
import type {Group} from '@mattermost/types/groups';

import {getChannelStats, getChannelMembersByIds, removeChannelMember} from 'mattermost-redux/actions/channels';
import {getUser as loadUser} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import type {ActionFuncAsync} from 'types/store';

import {fetchChannelGroups} from './ik_channel_groups';
import {loadStatusesByIds} from './status_actions';

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

export function requestRemoveChannelMember(
    channel: Channel,
    userId: string,
    channelGroups: Group[],
): ActionFuncAsync<{groupOverlap?: Group[]}> {
    return async (dispatch) => {
        if (channelGroups.length > 0) {
            try {
                const userGroups = await Client4.getGroupsByUserId(userId);
                const userGroupIds = new Set(userGroups.map((g: Group) => g.id));
                const overlap = channelGroups.
                    filter((g) => userGroupIds.has(g.id)).
                    map((g) => ({...g}));
                if (overlap.length > 0) {
                    return {data: {groupOverlap: overlap}};
                }
            } catch {
                return {error: {message: 'Failed to check user groups'}};
            }
        }

        const result = await dispatch(removeChannelMember(channel.id, userId));
        if (!result.error) {
            dispatch(getChannelStats(channel.id));
        }
        return result as unknown as {data?: {groupOverlap?: Group[]}; error?: any};
    };
}
