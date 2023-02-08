// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

import {leaveCallInChannel, showSwitchCallModal, startOrJoinCallInChannel} from 'actions/calls';
import {Post} from 'mattermost-redux/types/posts';
import {GlobalState} from 'mattermost-redux/types/store';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {connectedKmeetCallUrl} from 'selectors/kmeet_calls';

import PostType from './component';

interface OwnProps {
    post: Post;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    const currentChannelID = getCurrentChannelId(state);
    const connectedKmeetUrl = (ownProps.post.props.conference_id && !ownProps.post.props.end_at) ? connectedKmeetCallUrl(state, currentChannelID) : '';

    return {
        ...ownProps,
        connectedKmeetUrl,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    onJoinCall: startOrJoinCallInChannel,
    showSwitchCallModal,
    leaveCallInChannel,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PostType);
