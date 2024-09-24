// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import type {Channel} from '@mattermost/types/channels';
import type {Post, PostMetadata} from '@mattermost/types/posts';
import type {UserProfile, UserStatus} from '@mattermost/types/users';

import type {DispatchFunc} from 'mattermost-redux/types/actions';

import {createPost} from 'actions/post_actions';
import {setGlobalItem} from 'actions/storage';
import {removeDraft, upsertScheduleDraft, updateDraft, setGlobalDraftSource} from 'actions/views/drafts';
import {closeModal, openModal} from 'actions/views/modals';
import {getGlobalItem} from 'selectors/storage';

import DraftListItem from 'components/drafts/list_item/list_item';
import PersistNotificationConfirmModal from 'components/persist_notification_confirm_modal';

import {ModalIdentifiers, StoragePrefixes} from 'utils/constants';

import type {GlobalState} from 'types/store';
import type {PostDraft} from 'types/store/draft';

type Props = {
    channel?: Channel;
    channelUrl: string;
    displayName: string;
    draftId: string;
    id: Channel['id'];
    postPriorityEnabled: boolean;
    status: UserStatus['status'];
    type: 'channel' | 'thread';
    user: UserProfile;
    value: PostDraft;
    isRemote: boolean;
    isScheduled: boolean;
    scheduledWillNotBeSent: boolean;
}

function ChannelDraft({
    channel,
    channelUrl,
    displayName,
    draftId,
    postPriorityEnabled,
    status,
    type,
    user,
    value,
    isRemote,
    isScheduled,
    scheduledWillNotBeSent,
    id: channelId,
}: Props) {
    const dispatch = useDispatch();
    const history = useHistory();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const channelDraft = useSelector((state: GlobalState) => getGlobalItem(state, StoragePrefixes.DRAFT + value.channelId, {}));

    const goToChannel = () => {
        history.push(channelUrl);
    };

    const handleOnEdit = () => {
        if (isScheduled) {
            setIsEditing(true);
            return;
        }
        history.push(channelUrl);
    };

    const handleOnDelete = useCallback((id: string) => {
        dispatch(removeDraft(id, channelId));
    }, [dispatch, channelId]);

    const doSubmit = useCallback((id: string, post: Post) => {
        dispatch(createPost(post, value.fileInfos));
        dispatch(removeDraft(id, channelId));
        history.push(channelUrl);
    }, [dispatch, history, value.fileInfos, channelId, channelUrl]);

    const showPersistNotificationModal = useCallback((id: string, post: Post) => {
        if (!channel) {
            return;
        }

        dispatch(openModal({
            modalId: ModalIdentifiers.PERSIST_NOTIFICATION_CONFIRM_MODAL,
            dialogType: PersistNotificationConfirmModal,
            dialogProps: {
                message: post.message,
                channelType: channel.type,
                specialMentions: specialMentionsInText(post.message),
                onConfirm: () => doSubmit(id, post),
            },
        }));
    }, [channel, dispatch, doSubmit]);

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

        if (postPriorityEnabled && hasRequestedPersistentNotifications(value?.metadata?.priority)) {
            showPersistNotificationModal(id, post);
            return;
        }

        doSubmit(id, post);
    }, [doSubmit, postPriorityEnabled, value, user.id, showPersistNotificationModal]);

    const handleOnSchedule = (scheduleUTCTimestamp: number) => {
        const newDraft = {
            ...value,
            timestamp: scheduleUTCTimestamp,
        };
        dispatch(upsertScheduleDraft(`${StoragePrefixes.DRAFT}${value.channelId}`, newDraft));
    };

    const handleOnScheduleDelete = async () => {
        const {message} = channelDraft;
        if (message) {
            dispatch(openModal({
                modalId: ModalIdentifiers.OVERRIDE_DRAFT,
                dialogType: OverrideDraftModal,
                dialogProps: {
                    message,
                    onConfirm: deleteSchedule,
                    onExited: () => dispatch(closeModal(ModalIdentifiers.OVERRIDE_DRAFT)),
                },
            }));
            return;
        }

        deleteSchedule();
    };

    const deleteSchedule = async () => {
        const newDraft = {...value};
        Reflect.deleteProperty(newDraft, 'timestamp');

        dispatch(setGlobalItem(`${StoragePrefixes.DRAFT}${newDraft.channelId}_${newDraft.id}`, {message: '', fileInfos: [], uploadsInProgress: []}));
        dispatch(setGlobalDraftSource(`${StoragePrefixes.DRAFT}${newDraft.channelId}_${newDraft.id}`, false));

        // Remove previously existing channel draft
        await dispatch(removeDraft(StoragePrefixes.DRAFT + newDraft.channelId, channel.id));

        // Update channel draft
        const {error} = await dispatch(updateDraft(StoragePrefixes.DRAFT + newDraft.channelId, value, '', true, true));
        if (error) {
            dispatch(setGlobalItem(`${StoragePrefixes.DRAFT}${newDraft.channelId}_${newDraft.id}`, value));
        }
    };

    if (!channel) {
        return null;
    }

    return (
        <DraftListItem
            kind='draft'
            type={type}
            itemId={draftId}
            user={user}
            showPriority={true}
            handleOnEdit={handleOnEdit}
            handleOnDelete={handleOnDelete}
            handleOnSend={handleOnSend}
            item={value}
            channelId={channelId}
            displayName={displayName}
            isRemote={isRemote || false}
            channel={channel}
            status={status}
        />
    );
}

export default memo(ChannelDraft);
