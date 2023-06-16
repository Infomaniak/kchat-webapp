// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useMemo, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import type {UserThread, UserThreadSynthetic} from '@mattermost/types/threads';
import type {Channel} from '@mattermost/types/channels';
import type {UserProfile, UserStatus} from '@mattermost/types/users';
import type {Post} from '@mattermost/types/posts';

import type {PostDraft} from 'types/store/draft';

import {getPost} from 'mattermost-redux/actions/posts';

import {selectPost} from 'actions/views/rhs';
import {removeDraft, updateDraft, upsertScheduleDraft} from 'actions/views/drafts';
import {makeOnSubmit} from 'actions/views/create_comment';
import {setGlobalItem} from 'actions/storage';

import {StoragePrefixes} from 'utils/constants';

import DraftTitle from '../draft_title';
import DraftActions from '../draft_actions';
import Panel from '../panel/panel';
import Header from '../panel/panel_header';
import PanelBody from '../panel/panel_body';

type Props = {
    channel: Channel;
    displayName: string;
    draftId: string;
    rootId: UserThread['id'] | UserThreadSynthetic['id'];
    status: UserStatus['status'];
    thread?: UserThread | UserThreadSynthetic;
    type: 'channel' | 'thread';
    user: UserProfile;
    value: PostDraft;
    isScheduled: boolean;
    scheduledWillNotBeSent: boolean;
}

function ThreadDraft({
    channel,
    displayName,
    draftId,
    rootId,
    status,
    thread,
    type,
    user,
    value,
    isScheduled,
    scheduledWillNotBeSent,
}: Props) {
    const dispatch = useDispatch<DispatchFunc>();
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        if (!thread?.id) {
            dispatch(getPost(rootId));
        }
    }, [thread?.id]);

    const onSubmit = useMemo(() => {
        if (thread) {
            return makeOnSubmit(channel.id, thread.id, '');
        }

        return () => () => Promise.resolve({data: true});
    }, [channel.id, thread?.id]);

    const handleOnDelete = (id: string) => {
        dispatch(removeDraft(id));
    };

    const handleOnEdit = (_e?: React.MouseEvent, redirectToThread?: boolean) => {
        if (!redirectToThread && isScheduled) {
            setIsEditing(true);
            return;
        }
        dispatch(selectPost({id: rootId, channel_id: channel.id} as Post));
    };

    const handleOnSend = async (id: string) => {
        const newDraft = {...value};
        Reflect.deleteProperty(newDraft, 'timestamp');
        await dispatch(onSubmit(newDraft));

        handleOnDelete(id);
        handleOnEdit(undefined, true);
    };

    const handleOnSchedule = (scheduleUTCTimestamp: number) => {
        const newDraft = {
            ...value,
            timestamp: scheduleUTCTimestamp,
        };
        dispatch(upsertScheduleDraft(`${StoragePrefixes.COMMENT_DRAFT}${rootId}`, newDraft, rootId));
    };

    const handleOnScheduleDelete = async () => {
        const newDraft = {...value};
        Reflect.deleteProperty(newDraft, 'timestamp');

        // Delete scheduled draft from store
        if (newDraft.id) {
            dispatch(setGlobalItem(`${StoragePrefixes.COMMENT_DRAFT}${newDraft.rootId}_${newDraft.id}`, {message: '', fileInfos: [], uploadsInProgress: []}));
        }

        // Remove previously existing thread draft
        await dispatch(removeDraft(StoragePrefixes.DRAFT + newDraft.channelId));

        // Update remote thread draft
        const {error} = await dispatch(updateDraft(StoragePrefixes.COMMENT_DRAFT + newDraft.rootId, newDraft, newDraft.rootId, true));
        if (error && newDraft.id) {
            dispatch(setGlobalItem(`${StoragePrefixes.COMMENT_DRAFT}${newDraft.rootId}_${newDraft.id}`, newDraft));
        }
    };

    if (!thread) {
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
                                channelName={channel.name}
                                channelType={channel.type}
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
                                type={type}
                                channel={channel}
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

export default memo(ThreadDraft);
