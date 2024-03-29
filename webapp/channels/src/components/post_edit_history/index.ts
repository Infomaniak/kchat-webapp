// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';

import {getChannel, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getPostEditHistory} from 'selectors/posts';
import {getSelectedPostId} from 'selectors/rhs';

import type {GlobalState} from 'types/store';

import PostEditHistory from './post_edit_history';

function mapStateToProps(state: GlobalState) {
    const selectedPostId = getSelectedPostId(state) || '';
    const originalPost = getPost(state, selectedPostId);
    const channelDisplayName = getCurrentChannel(state) ? getCurrentChannel(state).display_name : getChannel(state, originalPost.channel_id).display_name;

    return {
        channelDisplayName,
        originalPost,
        postEditHistory: getPostEditHistory(state),
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(PostEditHistory);
