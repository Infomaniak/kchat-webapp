// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {ActionCreatorsMapObject, Dispatch, bindActionCreators} from 'redux';

import {GlobalState} from 'types/store';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {connectedKmeetCallUrl} from '../../selectors/kmeet_calls';

import {startOrJoinCallInChannelV2} from 'actions/calls';

import {Action} from 'mattermost-redux/types/actions';

import MeetButton from './meet_button';

function mapStateToProps(state: GlobalState) {
    const currentChannelID = getCurrentChannelId(state);
    const connectedKmeetUrl = connectedKmeetCallUrl(state, currentChannelID);

    return {
        currentChannelID,
        hasCall: connectedKmeetUrl != null,
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<Action>, any>({
        startOrJoinCallInChannelV2,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MeetButton);
