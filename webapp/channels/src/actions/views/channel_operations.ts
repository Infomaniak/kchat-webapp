// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TeamTypes} from 'mattermost-redux/action_types';
import {
    leaveChannel as leaveChannelRedux,
    deleteChannel as deleteChannelRedux,
    unfavoriteChannel,
} from 'mattermost-redux/actions/channels';
import {selectTeam} from 'mattermost-redux/actions/teams';
import {
    getChannel,
    getChannelsNameMapInCurrentTeam,
    getCurrentChannelId,
    getMyChannels,
    getMyChannelMemberships,
    isFavoriteChannel,
} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam, getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getChannelByName} from 'mattermost-redux/utils/channel_utils';

import {closeRightHandSide} from 'actions/views/rhs';
import {getSelectedPost, getSelectedPostId} from 'selectors/rhs';
import LocalStorageStore from 'stores/local_storage_store';

import {getHistory} from 'utils/browser_history';
import {isArchivedChannel} from 'utils/channel_utils';
import {Constants} from 'utils/constants';

import type {ActionFuncAsync} from 'types/store';

export function leaveChannel(channelId: string): ActionFuncAsync {
    return async (dispatch, getState) => {
        let state = getState();
        const currentUserId = getCurrentUserId(state);
        const currentTeam = getCurrentTeam(state);
        if (!currentTeam) {
            return {data: false};
        }
        const channel = getChannel(state, channelId);
        const currentChannelId = getCurrentChannelId(state);

        if (isFavoriteChannel(state, channelId)) {
            dispatch(unfavoriteChannel(channelId));
        }

        const teamUrl = getCurrentRelativeTeamUrl(state);

        if (!isArchivedChannel(channel)) {
            LocalStorageStore.removePreviousChannel(currentUserId, currentTeam.id, state);
        }
        const {error} = await dispatch(leaveChannelRedux(channelId));
        if (error) {
            return {error};
        }
        state = getState();

        const prevChannelName = LocalStorageStore.getPreviousChannelName(currentUserId, currentTeam.id, state);
        const channelsInTeam = getChannelsNameMapInCurrentTeam(state);
        const prevChannel = getChannelByName(channelsInTeam, prevChannelName);
        if (!prevChannel || !getMyChannelMemberships(state)[prevChannel.id]) {
            LocalStorageStore.removePreviousChannel(currentUserId, currentTeam.id, state);
        }
        const selectedPost = getSelectedPost(state);
        const selectedPostId = getSelectedPostId(state);
        if (selectedPostId && selectedPost.exists === false) {
            dispatch(closeRightHandSide());
        }

        if (getMyChannels(getState()).filter((c) => c.type === Constants.OPEN_CHANNEL || c.type === Constants.PRIVATE_CHANNEL).length === 0) {
            LocalStorageStore.removePreviousChannel(currentUserId, currentTeam.id, state);
            dispatch(selectTeam(''));
            dispatch({type: TeamTypes.LEAVE_TEAM, data: currentTeam});
            getHistory().push('/');
        } else if (channelId === currentChannelId) {
            // We only need to leave the channel if we are in the channel
            getHistory().push(teamUrl);
        }

        return {
            data: true,
        };
    };
}

export function deleteChannel(channelId: string): ActionFuncAsync<boolean> {
    return async (dispatch, getState) => {
        const res = await dispatch(deleteChannelRedux(channelId));
        if (res.error) {
            return {data: false};
        }
        const state = getState();

        const selectedPost = getSelectedPost(state);
        const selectedPostId = getSelectedPostId(state);
        if (selectedPostId && !selectedPost.exists) {
            dispatch(closeRightHandSide());
        }

        return {data: true};
    };
}
