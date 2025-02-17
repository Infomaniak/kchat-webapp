// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {getConferenceByChannelId, getIsAnyUserInConference} from 'mattermost-redux/selectors/entities/kmeet_calls';
import {callDialingEnabled} from 'mattermost-redux/selectors/entities/preferences';
import type {Post} from 'mattermost-redux/types/posts';

import {leaveCallInChannel, showSwitchCallModal, startOrJoinCallInChannelV2} from 'actions/calls';
import {joinCall} from 'actions/kmeet_calls';

import type {GlobalState} from 'types/store';

import PostType from './component';

interface OwnProps {
    post: Post;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    const currentChannelID = getCurrentChannelId(state);
    const conference = (ownProps.post.props.conference_id && !ownProps.post.props.end_at) ? getConferenceByChannelId(state, currentChannelID) : undefined;
    const hasConferenceStarted = (ownProps.post.props.conference_id && !ownProps.post.props.end_at) ? getIsAnyUserInConference(state, currentChannelID) : undefined;

    return {
        ...ownProps,
        conference,
        hasConferenceStarted,
        isDialingEnabled: callDialingEnabled(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    startOrJoinCallInChannelV2,
    showSwitchCallModal,
    leaveCallInChannel,
    joinCall,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PostType);
