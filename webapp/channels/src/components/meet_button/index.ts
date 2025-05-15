// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getCurrentChannel, getCurrentChannelMembersCount} from 'mattermost-redux/selectors/entities/channels';

import {startOrJoinCallInChannelV2} from 'actions/calls';
import {joinCall} from 'actions/kmeet_calls';
import {closeModal, openModal} from 'actions/views/modals';

import type {GlobalState} from 'types/store';

import MeetButton from './meet_button';

import {getConferenceByChannelId} from '../../selectors/kmeet_calls';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);
    const membersCount = getCurrentChannelMembersCount(state);
    const conference = getConferenceByChannelId(state, channel?.id);

    return {
        channel,
        hasCall: Boolean(conference),
        membersCount,
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

export default connect(mapStateToProps, mapDispatchToProps)(MeetButton);
