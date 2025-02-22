// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ClientError} from '@infomaniak/mattermost-client';
import {batchActions} from 'redux-batched-actions';

import type {Channel} from '@mattermost/types/channels';
import type {ServerError} from '@mattermost/types/errors';
import type {UserProfile} from '@mattermost/types/users';

import {PreferenceTypes} from 'mattermost-redux/action_types';
import * as ChannelActions from 'mattermost-redux/actions/channels';
import {fetchDeletedPostsIds, postDeleted} from 'mattermost-redux/actions/posts';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getChannelByName, getUnreadChannelIds, getChannel, getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentTeamUrl, getCurrentTeamId, getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import type {ActionFuncAsync, ActionResult} from 'mattermost-redux/types/actions';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded, loadProfilesForSidebar} from 'actions/user_actions';

import {getHistory} from 'utils/browser_history';
import {Constants, Preferences, NotificationLevels} from 'utils/constants';
import {getDirectChannelName} from 'utils/utils';

export function openDirectChannelToUserId(userId: UserProfile['id']): ActionFuncAsync<Channel> {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const channelName = getDirectChannelName(currentUserId, userId);
        const channel = getChannelByName(state, channelName);

        if (!channel) {
            return dispatch(ChannelActions.createDirectChannel(currentUserId, userId));
        }

        trackEvent('api', 'api_channels_join_direct');
        const now = Date.now();
        const prefDirect = {
            category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW,
            name: userId,
            value: 'true',
        };
        const prefOpenTime = {
            category: Preferences.CATEGORY_CHANNEL_OPEN_TIME,
            name: channel.id,
            value: now.toString(),
        };
        const actions = [{
            type: PreferenceTypes.RECEIVED_PREFERENCES,
            data: [prefDirect],
        }, {
            type: PreferenceTypes.RECEIVED_PREFERENCES,
            data: [prefOpenTime],
        }];
        dispatch(batchActions(actions));

        dispatch(savePreferences(currentUserId, [
            {user_id: currentUserId, ...prefDirect},
            {user_id: currentUserId, ...prefOpenTime},
        ]));

        return {data: channel};
    };
}

export function openGroupChannelToUserIds(userIds: Array<UserProfile['id']>): ActionFuncAsync<Channel> {
    return async (dispatch, getState) => {
        const result = await dispatch(ChannelActions.createGroupChannel(userIds));

        if (result.error) {
            getHistory().push(getCurrentTeamUrl(getState()));
        }

        return result;
    };
}

export function loadChannelsForCurrentUser(): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();
        const unreads = getUnreadChannelIds(state);

        await dispatch(ChannelActions.fetchChannelsAndMembers(getCurrentTeamId(state)));
        for (const id of unreads) {
            const channel = getChannel(state, id);
            if (channel && channel.type === Constants.DM_CHANNEL) {
                dispatch(loadNewDMIfNeeded(channel.id));
            } else if (channel && channel.type === Constants.GM_CHANNEL) {
                dispatch(loadNewGMIfNeeded(channel.id));
            }
        }

        loadProfilesForSidebar();
        return {data: true};
    };
}

export function loadDeletedPosts(channelId: string, lastDisconnectAt: number): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();

        const results = await dispatch(fetchDeletedPostsIds(channelId, lastDisconnectAt)) as ActionResult<string[] | null, ClientError>;
        const error = results.error;

        if (error && error.status_code === 403) {
            const currentTeamId = getCurrentTeamId(state);
            const redirectChannel = getRedirectChannelNameForTeam(state, currentTeamId);
            const teamUrl = getCurrentRelativeTeamUrl(state);
            getHistory().push(`${teamUrl}/channels/${redirectChannel}`);
        }

        if (results.data && Array.isArray(results.data)) {
            results.data.forEach((postId) => {
                const post = getPost(state, postId);

                if (post) {
                    dispatch(postDeleted(post));
                }
            });
        }

        return {data: true};
    };
}

export function searchMoreChannels(term: string, showArchivedChannels: boolean, hideJoinedChannels: boolean): ActionFunc<Channel[], ServerError> {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);

        if (!teamId) {
            throw new Error('No team id');
        }

        const {data, error} = await dispatch(ChannelActions.searchChannels(teamId, term, showArchivedChannels));
        if (data) {
            const myMembers = getMyChannelMemberships(state);
            const channels = hideJoinedChannels ? (data as Channel[]).filter((channel) => !myMembers[channel.id]) : data;
            return {data: channels};
        }

        return {error};
    };
}

export function autocompleteChannels(term: string, success: (channels: Channel[]) => void, error?: (err: ServerError) => void): ActionFuncAsync<boolean> {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);
        if (!teamId) {
            return {data: false};
        }

        const {data, error: err} = await dispatch(ChannelActions.autocompleteChannels(teamId, term));
        if (data && success) {
            success(data);
        } else if (err && error) {
            error({id: err.server_error_id, ...err});
        }

        return {data: true};
    };
}

export function autocompleteChannelsForSearch(term: string, success?: (channels: Channel[]) => void, error?: (err: ServerError) => void): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);

        if (!teamId) {
            return {data: false};
        }

        const {data, error: err} = await dispatch(ChannelActions.autocompleteChannelsForSearch(teamId, term));
        if (data && success) {
            success(data);
        } else if (err && error) {
            error({id: err.server_error_id, ...err});
        }
        return {data: true};
    };
}

export function addUsersToChannel(channelId: Channel['id'], userIds: Array<UserProfile['id']>): ActionFuncAsync {
    return async (dispatch) => {
        try {
            const requests = userIds.map((uId) => dispatch(ChannelActions.addChannelMember(channelId, uId)));

            await Promise.all(requests);

            return {data: true};
        } catch (error) {
            return {error};
        }
    };
}

export function unmuteChannel(userId: UserProfile['id'], channelId: Channel['id']) {
    return ChannelActions.updateChannelNotifyProps(userId, channelId, {
        mark_unread: NotificationLevels.ALL,
    });
}

export function muteChannel(userId: UserProfile['id'], channelId: Channel['id']) {
    return ChannelActions.updateChannelNotifyProps(userId, channelId, {
        mark_unread: NotificationLevels.MENTION,
    });
}

