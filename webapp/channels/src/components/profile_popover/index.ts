// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getCurrentTeamAccountId, getCurrentTeamName} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';


import {startOrJoinCallInChannelV2} from '../../actions/calls';
import {joinCall} from '../../actions/kmeet_calls';
import {closeModal, openModal} from '../../actions/views/modals';
import type {GlobalState} from '../../types/store';
import {UserStatuses} from '../../utils/constants';
import {ProfilePopoverProps, ProfilePopoverWcController} from "./profile_popover_wc_controller";

function mapStateToProps(state: GlobalState, ownProps: ProfilePopoverProps) {
    const currentUser = getCurrentUser(state);
    const currentTeamAccountId = getCurrentTeamAccountId(state);
    const currentTeamName = getCurrentTeamName(state);
    const userStatus = (ownProps.user?.id && getStatusForUserId(state, ownProps.user?.id)) || UserStatuses.OFFLINE;
    return {
        currentUser,
        currentTeamAccountId,
        currentTeamName,
        userStatus,
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators({
            startOrJoinCallInChannelV2,
            joinCall,
            openModal,
            closeModal,
        }, dispatch),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePopoverWcController);
