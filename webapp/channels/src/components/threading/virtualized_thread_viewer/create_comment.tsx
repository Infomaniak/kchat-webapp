// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, forwardRef, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {ArchiveOutlineIcon} from '@mattermost/compass-icons/components';
import type {Post} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {Posts} from 'mattermost-redux/constants';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPost, getLimitedViews} from 'mattermost-redux/selectors/entities/posts';

import AdvancedCreateComment from 'components/advanced_create_comment';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import BasicSeparator from 'components/widgets/separator/basic-separator';

import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

type Props = {
    focusOnMount: boolean;
    teammate?: UserProfile;
    threadId: string;
    latestPostId: Post['id'];
    isThreadView?: boolean;
    placeholder?: string;
};

const CreateComment = forwardRef<HTMLDivElement, Props>(({
    focusOnMount,
    teammate,
    threadId,
    latestPostId,
    isThreadView,
    placeholder,
}: Props, ref) => {
    const getChannel = useMemo(makeGetChannel, []);
    const rootPost = useSelector((state: GlobalState) => getPost(state, threadId));
    const threadIsLimited = useSelector(getLimitedViews).threads[threadId];
    const channel = useSelector((state: GlobalState) => {
        if (threadIsLimited) {
            return null;
        }
        return getChannel(state, {id: rootPost.channel_id});
    });
    if (!channel || threadIsLimited) {
        return null;
    }
    const rootDeleted = (rootPost as Post).state === Posts.POST_DELETED;
    const isFakeDeletedPost = rootPost.type === Constants.PostTypes.FAKE_PARENT_DELETED;

    const channelType = channel.type;
    const channelIsArchived = channel.delete_at !== 0;

    if (channelType === Constants.DM_CHANNEL && teammate?.delete_at) {
        return (
            <div
                className='post-create-message'
            >
                <FormattedMarkdownMessage
                    id='create_post.deactivated'
                    defaultMessage='You are viewing an archived channel with a **deactivated user**. New messages cannot be posted.'
                />
            </div>
        );
    }

    if (isFakeDeletedPost) {
        return null;
    }

    if (channelIsArchived) {
        return (
            <div className='channel-archived-warning__container'>
                <BasicSeparator/>
                <div className='channel-archived-warning__content'>
                    <ArchiveOutlineIcon
                        size={20}
                        color={'rgba(var(--center-channel-color-rgb), 0.75)'}
                    />
                    <FormattedMarkdownMessage
                        id='threadFromArchivedChannelMessage'
                        defaultMessage='You are viewing a thread from an **archived channel**. New messages cannot be posted.'
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className='post-create__container'
            ref={ref}
            data-testid='comment-create'
        >
            <AdvancedCreateComment
                placeholder={placeholder}
                focusOnMount={focusOnMount}
                channelId={channel.id}
                latestPostId={latestPostId}
                rootDeleted={rootDeleted}
                rootId={threadId}
                isThreadView={isThreadView}
            />
        </div>
    );
});

export default memo(CreateComment);
