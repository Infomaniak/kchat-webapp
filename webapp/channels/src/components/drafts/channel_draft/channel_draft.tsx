// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {ModalIdentifiers, StoragePrefixes} from 'utils/constants';

import type {Channel} from '@mattermost/types/channels';
import type {Post, PostMetadata} from '@mattermost/types/posts';
import type {UserProfile, UserStatus} from '@mattermost/types/users';

import type {DispatchFunc} from 'mattermost-redux/types/actions';

import {createPost} from 'actions/post_actions';
import {setGlobalItem} from 'actions/storage';
import {removeDraft, upsertScheduleDraft, addToUpdateDraftQueue, setGlobalDraftSource} from 'actions/views/drafts';
import {closeModal, openModal} from 'actions/views/modals';
import {getGlobalItem} from 'selectors/storage';

import OverrideDraftModal from 'components/schedule_post/override_draft_modal';

import type {GlobalState} from 'types/store';
import type {PostDraft} from 'types/store/draft';

import DraftActions from '../draft_actions';
import DraftTitle from '../draft_title';
import Panel from '../panel/panel';
import PanelBody from '../panel/panel_body';
import Header from '../panel/panel_header';

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
    isRemote: boolean;
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
    isRemote,
    isScheduled,
    scheduledWillNotBeSent,
}: Props) {
    const dispatch = useDispatch<DispatchFunc>();
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
        dispatch(removeDraft(id, channel.id));
    }, [dispatch, channel.id]);

    const handleOnSend = async (id: string) => {
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
        dispatch(removeDraft(id, channel.id));

        history.push(channelUrl);
    };

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
        const {error} = await dispatch(addToUpdateDraftQueue(StoragePrefixes.DRAFT + newDraft.channelId, value, '', true, true));
        if (error) {
            dispatch(setGlobalItem(`${StoragePrefixes.DRAFT}${newDraft.channelId}_${newDraft.id}`, value));
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
                                goToChannel={goToChannel}
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
                                goToChannel={goToChannel}
                            />
                        )}
                        timestamp={value.updateAt}
                        remote={isRemote || false}
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
