// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

import {Post} from 'mattermost-redux/types/posts';
import {GlobalState} from 'mattermost-redux/types/store';

import {leaveCallInChannel, showSwitchCallModal, startOrJoinCallInChannelV2} from 'actions/calls';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {connectedKmeetCallUrl} from 'selectors/kmeet_calls';

import {callDialingEnabled} from 'mattermost-redux/selectors/entities/preferences';

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
        isDialingEnabled: callDialingEnabled(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    startOrJoinCallInChannelV2,
    showSwitchCallModal,
    leaveCallInChannel,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PostType);
