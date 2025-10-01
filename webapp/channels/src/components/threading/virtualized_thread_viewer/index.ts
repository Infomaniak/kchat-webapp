// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {Post} from '@mattermost/types/posts';

import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {measureRhsOpened} from 'actions/views/rhs';
import {getIsPostBeingEditedInRHS} from 'selectors/posts';
import {makePrepareReplyIdsForThreadViewer, makeGetThreadLastViewedAt} from 'selectors/views/threads';

import type {GlobalState} from 'types/store';
import type {FakePost} from 'types/store/rhs';

import ThreadViewerVirtualized from './virtualized_thread_viewer';

type OwnProps = {
    channelId: string;
    postIds: Array<Post['id'] | FakePost['id']>;
    selected: Post | FakePost;
    useRelativeTimestamp: boolean;
    onCardClick: (post: Post) => void;
}

function makeMapStateToProps() {
    const getRepliesListWithSeparators = makePrepareReplyIdsForThreadViewer();
    const getThreadLastViewedAt = makeGetThreadLastViewedAt();

    return (state: GlobalState, ownProps: OwnProps) => {
        const {postIds, useRelativeTimestamp, selected, channelId} = ownProps;

        const collapsedThreads = isCollapsedThreadsEnabled(state);
        const currentUserId = getCurrentUserId(state);
        const lastViewedAt = getThreadLastViewedAt(state, selected.id);
        const directTeammate = getDirectTeammate(state, channelId);

        const lastPost = getPost(state, postIds[0]);

        const replyListIds = getRepliesListWithSeparators(state, {
            postIds,
            showDate: !useRelativeTimestamp,
            lastViewedAt: collapsedThreads ? lastViewedAt : undefined,
        });
        const newMessagesSeparatorActions = state.plugins.components.NewMessagesSeparatorAction;

        const myChannelMemberships = getMyChannelMemberships(state);
        const isMember = Boolean(myChannelMemberships[channelId]);

        const postsEditingMap: Record<string, boolean> = {};
        replyListIds.forEach((postId) => {
            postsEditingMap[postId] = getIsPostBeingEditedInRHS(state, postId);
        });

        return {
            currentUserId,
            directTeammate,
            lastPost,
            replyListIds,
            isMember,
            newMessagesSeparatorActions,
            postsEditingMap,
        };
    };
}

const mapDispatchToProps = {
    measureRhsOpened,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(ThreadViewerVirtualized);
