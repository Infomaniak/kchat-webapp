// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ProfilePopoverController} from './profile_popover_controller';
import type {GlobalState} from "../../types/store";
import {getCurrentUser} from "mattermost-redux/selectors/entities/users";
import {bindActionCreators, Dispatch} from "redux";
import {startOrJoinCallInChannelV2} from "../../actions/calls";
import {joinCall} from "../../actions/kmeet_calls";
import {closeModal, openModal} from "../../actions/views/modals";
import {connect} from "react-redux";
import {getCurrentTeamAccountId, getCurrentTeamName} from "mattermost-redux/selectors/entities/teams";


function mapStateToProps(state: GlobalState) {
    const currentUser = getCurrentUser(state);
    const currentTeamAccountId = getCurrentTeamAccountId(state);
    const currentTeamName = getCurrentTeamName(state);

    return {
        currentUser,
        currentTeamAccountId,
        currentTeamName,
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePopoverController);
