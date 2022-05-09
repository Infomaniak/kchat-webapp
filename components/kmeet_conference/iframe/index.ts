// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

// import {GenericAction} from 'mattermost-redux/types/actions';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannelId, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {GlobalState} from 'types/store';

// import {showExpandedView} from 'actions/calls';
import {ActionTypes} from 'utils/constants';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {expandedView} from 'selectors/calls';

import IFrame from './call_iframe';

function mapStateToProps(state: GlobalState) {
    return {
        currentUserId: getCurrentUserId(state),
        channelID: getCurrentChannelId(state),
        portal: expandedView(state),
    };
}

function disconnect(channelID: string) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({
            type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
            data: {
                channelID,
                userID: getCurrentUserId(getState()),
                currentUserID: getCurrentUserId(getState()),
            },
        });
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    disconnectFunc: disconnect,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(IFrame);
