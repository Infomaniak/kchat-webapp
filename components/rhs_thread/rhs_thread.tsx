// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {useRouteMatch} from 'react-router-dom';

import {Channel} from '@mattermost/types/channels';
import {Post} from '@mattermost/types/posts';
import {FakePost, RhsState} from 'types/store/rhs';

import RhsHeaderPost from 'components/rhs_header_post';
import ThreadViewer from 'components/threading/thread_viewer';
import {closeRightHandSide} from 'actions/views/rhs';
import {Team} from '@mattermost/types/teams';

type Props = {
    currentTeam: Team;
    posts: Post[];
    channel: Channel | null;
    selected: Post | FakePost;
    previousRhsState?: RhsState;
    wasOpen: boolean;
}

const RhsThread = ({
    currentTeam,
    channel,
    posts,
    selected,
    previousRhsState,
    wasOpen,
}: Props) => {
    const dispatch = useDispatch();
    const fromDraftOrThread = useRouteMatch(['/:team/drafts', '/:team/threads']);

    useEffect(() => {
        if (channel?.team_id && channel.team_id !== currentTeam.id) {
            // if team-scoped and mismatched team, close rhs
            dispatch(closeRightHandSide());
        }
    }, [currentTeam, channel]);

    if (posts == null || selected == null || !channel) {
        return (
            <div/>
        );
    }

    // defined the focus on the required textbox depending on the provenance scenario.
    const focusRhsTextbox = !((fromDraftOrThread && fromDraftOrThread.isExact) || !wasOpen);

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <RhsHeaderPost
                rootPostId={selected.id}
                channel={channel}
                previousRhsState={previousRhsState}
            />
            <ThreadViewer
                rootPostId={selected.id}
                useRelativeTimestamp={false}
                isThreadView={focusRhsTextbox}
            />
        </div>
    );
};

export default memo(RhsThread);

