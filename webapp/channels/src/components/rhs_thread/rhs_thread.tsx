// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {Post} from '@mattermost/types/posts';
import type {Team} from '@mattermost/types/teams';

import {closeRightHandSide} from 'actions/views/rhs';

import PostView from 'components/post_view/post_view';
import RhsHeaderPost from 'components/rhs_header_post';
import ThreadViewer from 'components/threading/thread_viewer';

import type {FakePost, RhsState} from 'types/store/rhs';

type Props = {
    currentTeam?: Team;
    channel?: Channel;
    selected: Post | FakePost;
    previousRhsState?: RhsState;
}

const RhsThread = ({
    currentTeam,
    channel,
    selected,
    previousRhsState,
}: Props) => {
    const [displayThreadList, setDisplayThreadList] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (channel?.team_id && channel.team_id !== currentTeam?.id) {
            // if team-scoped and mismatched team, close rhs
            dispatch(closeRightHandSide());
        }
    }, [currentTeam, channel, dispatch]);

    const onChatHistoryClick = () => {
        setDisplayThreadList((prevState) => !prevState);
    };

    if (selected == null || !channel) {
        return (
            <div/>
        );
    }

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
            {displayThreadList ? (
                <PostView
                    channelLoading={false}
                    channelId={channel.id}
                    unreadScrollPosition={''}
                    isThreadView={true}
                />
            ) : (
                <ThreadViewer
                    rootPostId={selected.id}
                    useRelativeTimestamp={false}
                    isThreadView={false}
                />
            )}
        </div>
    );
};

export default memo(RhsThread);

