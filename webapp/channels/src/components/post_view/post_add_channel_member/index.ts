// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {addChannelMember, notifyChannelMember} from 'mattermost-redux/actions/channels';
import {removePost} from 'mattermost-redux/actions/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import type {GenericAction} from 'mattermost-redux/types/actions';
import {getLatestReplyablePostId} from 'mattermost-redux/selectors/entities/posts';

import PostAddChannelMember from './post_add_channel_member';

type OwnProps = {
    postId: string;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const latestPostId = getLatestReplyablePostId(state);
    const post = getPost(state, ownProps.postId) || {};
    let channelType = '';
    if (post && post.channel_id) {
        const channel = getChannel(state, post.channel_id);
        if (channel && channel.type) {
            channelType = channel.type;
        }
    }

    return {
        latestPostId,
        channelType,
        currentUser: getCurrentUser(state),
        post,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            notifyChannelMember,
            addChannelMember,
            removePost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAddChannelMember);
