// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo, useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {useHistory} from 'react-router-dom';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import type {UserThread, UserThreadSynthetic} from '@mattermost/types/threads';
import type {Channel} from '@mattermost/types/channels';
import type {UserProfile, UserStatus} from '@mattermost/types/users';
import type {Post} from '@mattermost/types/posts';

import type {PostDraft} from 'types/store/draft';
import {GlobalState} from 'types/store';

import {getPost} from 'mattermost-redux/actions/posts';

import {selectPost} from 'actions/views/rhs';
import {removeDraft, addToUpdateDraftQueue, upsertScheduleDraft} from 'actions/views/drafts';
import {makeOnSubmit} from 'actions/views/create_comment';
import {closeModal, openModal} from 'actions/views/modals';
import {setGlobalItem} from 'actions/storage';
import {getGlobalItem} from 'selectors/storage';

import {ModalIdentifiers, StoragePrefixes} from 'utils/constants';

import DraftTitle from '../draft_title';
import DraftActions from '../draft_actions';
import Panel from '../panel/panel';
import Header from '../panel/panel_header';
import PanelBody from '../panel/panel_body';
import OverrideDraftModal from 'components/schedule_post/override_draft_modal';

type Props = {
    channel: Channel;
    channelUrl: string;
    displayName: string;
    draftId: string;
    rootId: UserThread['id'] | UserThreadSynthetic['id'];
    status: UserStatus['status'];
    thread?: UserThread | UserThreadSynthetic;
    type: 'channel' | 'thread';
    user: UserProfile;
    value: PostDraft;
    isRemote: boolean;
    isScheduled: boolean;
    scheduledWillNotBeSent: boolean;
}

function ThreadDraft({
    channel,
    channelUrl,
    displayName,
    draftId,
    rootId,
    status,
    thread,
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
    const threadDraft = useSelector((state: GlobalState) => getGlobalItem(state, StoragePrefixes.COMMENT_DRAFT + value.rootId, {}));

    const goToChannel = () => {
        history.push(channelUrl);
    };

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

    const handleOnDelete = useCallback((id: string) => {
        dispatch(removeDraft(id, channel.id, rootId));
    }, [channel.id, rootId]);

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
        const {message} = threadDraft;
        if (message) {
            dispatch(openModal({
                modalId: ModalIdentifiers.OVERRIDE_DRAFT,
                dialogType: OverrideDraftModal,
                dialogProps: {
                    message,
                    onConfirm: onDelete,
                    onExited: () => dispatch(closeModal(ModalIdentifiers.OVERRIDE_DRAFT)),
                },
            }));
            return;
        }

        onDelete();
    };

    const onDelete = async () => {
        const newDraft = {...value};
        Reflect.deleteProperty(newDraft, 'timestamp');

        dispatch(setGlobalItem(`${StoragePrefixes.COMMENT_DRAFT}${newDraft.rootId}_${newDraft.id}`, {message: '', fileInfos: [], uploadsInProgress: []}));

        // Remove previously existing thread draft
        await dispatch(removeDraft(StoragePrefixes.COMMENT_DRAFT + newDraft.rootId, channel.id, rootId));

        // Update thread draft
        const {error} = await dispatch(addToUpdateDraftQueue(StoragePrefixes.COMMENT_DRAFT + newDraft.rootId, newDraft, newDraft.rootId, true));
        if (error) {
            dispatch(setGlobalItem(`${StoragePrefixes.COMMENT_DRAFT}${newDraft.rootId}_${newDraft.id}`, value));
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
                                type={type}
                                channel={channel}
                                userId={user.id}
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
