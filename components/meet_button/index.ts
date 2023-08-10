// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {connectedKmeetCallUrl} from '../../selectors/kmeet_calls';

import {startOrJoinKmeetCallInChannel} from 'actions/calls';

import MeetButton from './meet_button';

function mapStateToProps(state: GlobalState) {
    const currentChannelID = getCurrentChannelId(state);
    const connectedKmeetUrl = connectedKmeetCallUrl(state, currentChannelID);

    return {
        currentChannelID,
        hasCall: connectedKmeetUrl != null,
    };
}

const actions = {
    startCallInChannel: startOrJoinKmeetCallInChannel,
};

export default connect(mapStateToProps, actions)(MeetButton);
