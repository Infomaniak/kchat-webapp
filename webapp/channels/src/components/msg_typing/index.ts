// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {makeGetUsersTypingByChannelAndPost} from 'mattermost-redux/selectors/entities/typing';

import type {GlobalState} from 'types/store';

import {userStartedRecording, userStartedTyping, userStoppedRecording, userStoppedTyping} from './actions';
import MsgTyping from './msg_typing';

type OwnProps = {
    channelId: string;
    currentUserId: string;
    rootId: string;
};

function makeMapStateToProps() {
    const getUsersTypingByChannelAndPost = makeGetUsersTypingByChannelAndPost();
    const getUsersRecordingByChannelAndPost = makeGetUsersTypingByChannelAndPost('recording');

    return function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
        const typingUsers = getUsersTypingByChannelAndPost(state, {channelId: ownProps.channelId, postId: ownProps.rootId});

        const currentUserId = getCurrentUserId(state);
        const recordingUsers = getUsersRecordingByChannelAndPost(state, {channelId: ownProps.channelId, postId: ownProps.postId});
        return {
            typingUsers,
            recordingUsers,
            currentUserId,
        };
    };
}

const mapDispatchToProps = {
    userStartedTyping,
    userStoppedTyping,
    userStartedRecording,
    userStoppedRecording,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(MsgTyping);
