// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getCurrentChannel, getCurrentChannelMembersCount} from 'mattermost-redux/selectors/entities/channels';
import type {Action} from 'mattermost-redux/types/actions';

import {startOrJoinCallInChannelV2} from 'actions/calls';
import {closeModal, openModal} from 'actions/views/modals';

import type {GlobalState} from 'types/store';

import MeetButton from './meet_button';

import {connectedKmeetCallUrl} from '../../selectors/kmeet_calls';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);
    const connectedKmeetUrl = connectedKmeetCallUrl(state, channel.id);
    const membersCount = getCurrentChannelMembersCount(state);

    return {
        channel,
        hasCall: connectedKmeetUrl != null,
        membersCount,
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<Action>, any>({
        startOrJoinCallInChannelV2,
        openModal,
        closeModal,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MeetButton);
