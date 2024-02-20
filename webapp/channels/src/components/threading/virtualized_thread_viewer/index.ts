// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {Post} from '@mattermost/types/posts';

import {getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import {makePrepareReplyIdsForThreadViewer, makeGetThreadLastViewedAt} from 'selectors/views/threads';

import type {GlobalState} from 'types/store';
import type {FakePost} from 'types/store/rhs';

import ThreadViewerVirtualized from './virtualized_thread_viewer';

type OwnProps = {
    channel: Channel;
    postIds: Array<Post['id'] | FakePost['id']>;
    selected: Post | FakePost;
    useRelativeTimestamp: boolean;
    onCardClick: (post: Post) => void;
    isMember: boolean;
}

function makeMapStateToProps() {
    const getRepliesListWithSeparators = makePrepareReplyIdsForThreadViewer();
    const getThreadLastViewedAt = makeGetThreadLastViewedAt();

    return (state: GlobalState, ownProps: OwnProps) => {
        const {postIds, useRelativeTimestamp, selected, channel} = ownProps;

        const collapsedThreads = isCollapsedThreadsEnabled(state);
        const currentUserId = getCurrentUserId(state);
        const lastViewedAt = getThreadLastViewedAt(state, selected.id);
        const directTeammate = getDirectTeammate(state, channel.id);

        const lastPost = getPost(state, postIds[0]);

        const replyListIds = getRepliesListWithSeparators(state, {
            postIds,
            showDate: !useRelativeTimestamp,
            lastViewedAt: collapsedThreads ? lastViewedAt : undefined,
        });

        return {
            currentUserId,
            directTeammate,
            lastPost,
            replyListIds,
            teamId: channel.team_id,
            isMember: Boolean(state.entities.channels.myMembers[channel?.id]),
            isGuest: isCurrentUserGuestUser(state),
        };
    };
}

export default connect(makeMapStateToProps)(ThreadViewerVirtualized);
