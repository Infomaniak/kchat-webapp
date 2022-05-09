// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {voiceConnectedChannels} from 'selectors/calls';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {startOrJoinCallInChannel} from 'actions/calls';

import MeetButton from './meet_button';

function mapStateToProps(state: GlobalState) {
    // const connectedCall = connectedCallID(state) || '';
    // const connectedChannel = connectedChannelID(state);
    const channels = voiceConnectedChannels(state);

    return {
        currentChannelID: getCurrentChannelId(state),
        hasCall: channels[getCurrentChannelId(state)],
    };
}

const actions = {
    startCallInChannel: startOrJoinCallInChannel,
};

export default connect(mapStateToProps, actions)(MeetButton);
