// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {connectedCallID, voiceConnectedChannels} from 'selectors/calls';

import {getCurrentChannelId, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {startOrJoinCallInChannel} from 'actions/calls';

import MeetButton from './meet_button';

function mapStateToProps(state: GlobalState) {
    const connectedCall = connectedCallID(state);
    const currentChannelID = getCurrentChannelId(state);
    const channels = voiceConnectedChannels(state);

    return {
        currentChannelID,
        hasCall: channels[currentChannelID],
        isInCall: channels[currentChannelID] &&
            channels[currentChannelID][connectedCall] &&
            channels[currentChannelID][connectedCall].includes(getCurrentUserId(state)),
    };
}

const actions = {
    startCallInChannel: startOrJoinCallInChannel,
};

export default connect(mapStateToProps, actions)(MeetButton);
