// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {Channel} from '@mattermost/types/channels';

import {getChannelStats, updateChannelMemberSchemeRoles, removeChannelMember, getChannelMember} from 'mattermost-redux/actions/channels';
import {getGroupsByUserId} from 'mattermost-redux/actions/groups';
import {Permissions} from 'mattermost-redux/constants';
import {getHasChannelMembersAdmin} from 'mattermost-redux/selectors/entities/channels';
import {getGroupsAssociatedToChannel} from 'mattermost-redux/selectors/entities/groups';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentUserId, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';

import {canManageMembers} from 'utils/channel_utils';

import type {GlobalState} from 'types/store';

import ChannelMembersDropdown from './channel_members_dropdown';

interface OwnProps {
    channel: Channel;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const {channel} = ownProps;
    const canChangeMemberRoles = haveIChannelPermission(
        state,
        channel.team_id,
        channel.id,
        Permissions.MANAGE_CHANNEL_ROLES,
    ) && canManageMembers(state, channel);
    const canRemoveMember = canManageMembers(state, channel);
    const hasChannelMembersAdmin = getHasChannelMembersAdmin(state, channel.id);
    const channelGroups = getGroupsAssociatedToChannel(state, channel.id);
    const isSystemAdmin = isCurrentUserSystemAdmin(state);

    return {
        currentUserId: getCurrentUserId(state),
        canChangeMemberRoles,
        canRemoveMember,
        hasChannelMembersAdmin,
        channelGroups,
        isSystemAdmin,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getChannelMember,
            getChannelStats,
            updateChannelMemberSchemeRoles,
            removeChannelMember,
            openModal,
            getGroupsByUserId,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelMembersDropdown);
