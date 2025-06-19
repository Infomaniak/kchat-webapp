// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {getCurrentTeamAccountId, getCurrentTeamName} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getStatusForUserId, getUser as selectUser} from 'mattermost-redux/selectors/entities/users';

import {getDefaultChannelId} from './profile_popover';
import {getIsChannelAdmin, getIsTeamAdmin} from './profile_popover_title';
import type {
    ProfilePopoverAdditionalProps,
    ProfilePopoverProps} from './profile_popover_wc_controller';
import {
    ProfilePopoverWcController,
} from './profile_popover_wc_controller';

import type {GlobalState} from '../../types/store';
import {UserStatuses} from '../../utils/constants';

function mapStateToProps(state: GlobalState, ownProps: ProfilePopoverProps): ProfilePopoverAdditionalProps {
    const channelId = ownProps.channelId || getDefaultChannelId(state);
    const currentUser = getCurrentUser(state);
    const currentTeamAccountId = getCurrentTeamAccountId(state);
    const currentTeamName = getCurrentTeamName(state);
    const user = selectUser(state, ownProps.userId) as UserProfile | undefined;
    const userStatus = (ownProps.userId && getStatusForUserId(state, ownProps.userId)) || UserStatuses.OFFLINE;

    const isTeamAdmin = getIsTeamAdmin(state, ownProps.userId);
    const isChannelAdmin = getIsChannelAdmin(state, ownProps.userId, channelId);

    return {
        channelId,
        currentTeamAccountId,
        currentTeamName,
        currentUser,
        user,
        userStatus,
        isTeamAdmin,
        isChannelAdmin,
    };
}

export default connect(mapStateToProps)(ProfilePopoverWcController);
