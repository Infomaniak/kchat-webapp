// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import type {ScheduledPost} from '@mattermost/types/schedule_post';
import type {UserProfile, UserStatus} from '@mattermost/types/users';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';

import DraftListItem from 'components/drafts/list_item/list_item';

import type {GlobalState} from 'types/store';

type Props = {
    scheduledPost: ScheduledPost;
    user: UserProfile;
    displayName: string;
    status: UserStatus['status'];
}

const getChannel = makeGetChannel();

export default function ScheduledPostItem({scheduledPost, user, displayName, status}: Props) {
    const channel = useSelector((state: GlobalState) => getChannel(state, {id: scheduledPost.channel_id}));

    if (!channel) {
        return null;
    }

    return (
        <DraftListItem
            kind='scheduledPost'
            type={scheduledPost.root_id ? 'thread' : 'channel'}
            itemId={scheduledPost.id}
            user={user}
            showPriority={true}
            handleOnEdit={() => {}}
            handleOnDelete={() => {}}
            handleOnSend={() => {}}
            item={scheduledPost}
            channelId={scheduledPost.channel_id}
            displayName={displayName}
            isRemote={false}
            channel={channel}
            status={status}
        />
    );
}
