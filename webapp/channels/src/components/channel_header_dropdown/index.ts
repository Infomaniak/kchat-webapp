// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {
    getCurrentChannel,
    isCurrentChannelDefault,
    isCurrentChannelFavorite,
    isCurrentChannelMuted,
    isCurrentChannelArchived,
    getRedirectChannelNameForTeam,
} from 'mattermost-redux/selectors/entities/channels';
import {getConferenceByChannelId} from 'mattermost-redux/selectors/entities/kmeet_calls';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {
    getUser,
    getCurrentUser,
    getUserStatuses,
    getCurrentUserId,
} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';

import {startOrJoinCallInChannelV2} from 'actions/calls';
import {getPenultimateViewedChannelName} from 'selectors/local_storage';
import {getChannelHeaderMenuPluginComponents} from 'selectors/plugins';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils';

import type {GlobalState} from 'types/store';

import Desktop from './channel_header_dropdown';
import Items from './channel_header_dropdown_items';
import Mobile from './mobile_channel_header_dropdown';

const getTeammateId = createSelector(
    'getTeammateId',
    getCurrentChannel,
    getCurrentUserId,
    (channel, currentUserId) => {
        if (channel.type !== Constants.DM_CHANNEL) {
            return null;
        }

        return Utils.getUserIdFromChannelId(channel.name, currentUserId);
    },
);

const getTeammateStatus = createSelector(
    'getTeammateStatus',
    getUserStatuses,
    getTeammateId,
    (userStatuses, teammateId) => {
        if (!teammateId) {
            return undefined;
        }

        return userStatuses[teammateId];
    },
);

const mapStateToProps = (state: GlobalState) => {
    const user = getCurrentUser(state);
    const channel = getCurrentChannel(state);

    // Handle the case where channel is undefined (e.g the user leave the channel)
    const channelId = channel?.id || '';
    const channelName = channel?.name || '';
    const isDefault = channel ? isCurrentChannelDefault(state) : false;
    const isFavorite = channel ? isCurrentChannelFavorite(state) : false;
    const isMuted = channel ? isCurrentChannelMuted(state) : false;
    const isArchived = channel ? isCurrentChannelArchived(state) : false;
    const hasCall = channel ? getConferenceByChannelId(state, channelId) != null : false;

    return {
        user,
        channel,
        dmUserId: getUserIdFromChannelName(user.id, channelName),
        isDefault,
        isFavorite,
        isMuted,
        isReadonly: false,
        isArchived,
        penultimateViewedChannelName: getPenultimateViewedChannelName(state) || getRedirectChannelNameForTeam(state, getCurrentTeamId(state)),
        pluginMenuItems: getChannelHeaderMenuPluginComponents(state),
        isLicensedForLDAPGroups: state.entities.general.license.LDAPGroups === 'true',
        hasCall,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators({
            startOrJoinCallInChannelV2,
        }, dispatch),
    };
};

const mobileMapStateToProps = (state: GlobalState) => {
    const user = getCurrentUser(state);
    const channel = getCurrentChannel(state);
    const teammateId = getTeammateId(state);

    let teammateIsBot = false;
    let displayName = '';
    if (teammateId) {
        const teammate = getUser(state, teammateId);
        teammateIsBot = teammate && teammate.is_bot;
        displayName = Utils.getDisplayNameByUser(state, teammate);
    }

    return {
        user,
        channel,
        teammateId,
        teammateIsBot,
        teammateStatus: getTeammateStatus(state),
        displayName,
    };
};

export const ChannelHeaderDropdown = Desktop;
export const ChannelHeaderDropdownItems = connect(mapStateToProps, mapDispatchToProps)(Items);
export const MobileChannelHeaderDropdown = connect(mobileMapStateToProps)(Mobile);
