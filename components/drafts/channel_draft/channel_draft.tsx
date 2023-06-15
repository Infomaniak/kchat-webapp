// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {createPost} from 'actions/post_actions';
import {setGlobalItem} from 'actions/storage';
import {removeDraft, upsertScheduleDraft, updateDraft} from 'actions/views/drafts';
import {PostDraft} from 'types/store/draft';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import type {Channel} from '@mattermost/types/channels';
import type {UserProfile, UserStatus} from '@mattermost/types/users';
import {Post, PostMetadata} from '@mattermost/types/posts';
import {StoragePrefixes} from 'utils/constants';

import DraftTitle from '../draft_title';
import DraftActions from '../draft_actions';
import Panel from '../panel/panel';
import Header from '../panel/panel_header';
import PanelBody from '../panel/panel_body';

type Props = {
    channel: Channel;
    channelUrl: string;
    displayName: string;
    draftId: string;
    id: Channel['id'];
    status: UserStatus['status'];
    type: 'channel' | 'thread';
    user: UserProfile;
    value: PostDraft;
    isScheduled: boolean;
    scheduledWillNotBeSent: boolean;
}

function ChannelDraft({
    channel,
    channelUrl,
    displayName,
    draftId,
    status,
    type,
    user,
    value,
    isScheduled,
    scheduledWillNotBeSent,
}: Props) {
    const dispatch = useDispatch<DispatchFunc>();
    const history = useHistory();
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const handleOnEdit = useCallback(() => {
        if (isScheduled) {
            setIsEditing(true);
            return;
        }
        history.push(channelUrl);
    }, [channelUrl, isScheduled]);

    const handleOnDelete = useCallback((id: string) => {
        dispatch(removeDraft(id));
    }, [channel.id]);

    const handleOnSend = useCallback(async (id: string) => {
        const post = {} as Post;
        post.file_ids = [];
        post.message = value.message;
        post.props = value.props || {};
        post.user_id = user.id;
        post.channel_id = value.channelId;
        post.metadata = (value.metadata || {}) as PostMetadata;

        if (post.message.trim().length === 0 && value.fileInfos.length === 0) {
            return;
        }

        dispatch(createPost(post, value.fileInfos));
        dispatch(removeDraft(id));

        history.push(channelUrl);
    }, [value, channelUrl, user.id, channel.id]);

    const handleOnSchedule = (scheduleUTCTimestamp: number) => {
        const newDraft = {
            ...value,
            timestamp: scheduleUTCTimestamp,
        };
        dispatch(upsertScheduleDraft(`${StoragePrefixes.DRAFT}${value.channelId}`, newDraft));
    };

    const handleOnScheduleDelete = async () => {
        const newDraft = {...value};
        Reflect.deleteProperty(newDraft, 'timestamp');

        // Delete scheduled draft from store
        if (newDraft.id) {
            dispatch(setGlobalItem(`${StoragePrefixes.DRAFT}${newDraft.channelId}_${newDraft.id}`, {message: '', fileInfos: [], uploadsInProgress: []}));
        }

        // Remove previously existing channel draft
        await dispatch(removeDraft(StoragePrefixes.DRAFT + newDraft.channelId));

        // Update server channel draft
        const {error} = await dispatch(updateDraft(StoragePrefixes.DRAFT + newDraft.channelId, newDraft, '', true));
        if (error && newDraft.id) {
            dispatch(setGlobalItem(`${StoragePrefixes.DRAFT}${newDraft.channelId}_${newDraft.id}`, newDraft));
        }
    };

    if (!channel) {
        return null;
    }

    return (
        <Panel
            onClick={handleOnEdit}
            isInvalid={scheduledWillNotBeSent}
        >
            {({hover}) => (
                <>
                    <Header
                        hover={hover}
                        actions={(
                            <DraftActions
                                channelDisplayName={channel.display_name}
                                channelType={channel.type}
                                channelName={channel.name}
                                userId={user.id}
                                draftId={draftId}
                                isScheduled={isScheduled}
                                scheduleTimestamp={value.timestamp}
                                isInvalid={scheduledWillNotBeSent}
                                onDelete={handleOnDelete}
                                onEdit={handleOnEdit}
                                onSend={handleOnSend}
                                onSchedule={handleOnSchedule}
                                onScheduleDelete={handleOnScheduleDelete}
                            />
                        )}
                        title={(
                            <DraftTitle
                                channel={channel}
                                type={type}
                                userId={user.id}
                            />
                        )}
                        timestamp={value.updateAt}
                        remote={value.remote || false}
                        isScheduled={isScheduled}
                        scheduledTimestamp={value.timestamp}
                        scheduledWillNotBeSent={scheduledWillNotBeSent}
                    />
                    <PanelBody
                        channelId={channel.id}
                        displayName={displayName}
                        fileInfos={value.fileInfos}
                        message={value.message}
                        status={status}
                        priority={value.metadata?.priority}
                        uploadsInProgress={value.uploadsInProgress}
                        userId={user.id}
                        username={user.username}
                        draft={value}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                    />
                </>
            )}
        </Panel>
    );
}

export default memo(ChannelDraft);
