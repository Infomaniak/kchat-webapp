// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {memo, useCallback, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {ScheduledPost, SchedulingInfo} from '@mattermost/types/schedule_post';

import {fetchMissingChannels} from 'mattermost-redux/actions/channels';
import {isDeactivatedDirectChannel} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';

import {SendPostOptions} from 'components/advanced_text_editor/send_button/send_post_options';
import Action from 'components/drafts/draft_actions/action';
import DeleteScheduledPostModal
    from 'components/drafts/draft_actions/schedule_post_actions/delete_scheduled_post_modal';
import SendDraftModal from 'components/drafts/draft_actions/send_draft_modal';

import Constants, {ModalIdentifiers} from 'utils/constants';

import './style.scss';
import type {GlobalState} from 'types/store';

const deleteTooltipText = (
    <FormattedMessage
        id='scheduled_post.action.delete'
        defaultMessage='Delete scheduled post'
    />
);

const editTooltipText = (
    <FormattedMessage
        id='scheduled_post.action.edit'
        defaultMessage='Edit scheduled post'
    />
);

const sendNowTooltipText = (
    <FormattedMessage
        id='scheduled_post.action.send_now'
        defaultMessage='Send now'
    />
);

const copyTextTooltipText = (
    <FormattedMessage
        id='scheduled_post.action.copy_text'
        defaultMessage='Copy text'
    />
);

type Props = {
    scheduledPost: ScheduledPost;
    channel?: Channel;
    onReschedule: (timestamp: number | 'monday' | 'tomorrow') => Promise<{error?: string}>;
    onDelete: (scheduledPostId: string) => Promise<{error?: string}>;
    onSend: (scheduledPostId: string) => void;
    onEdit: () => void;
    onCopyText: () => void;
}

function ScheduledPostActions({scheduledPost, channel, onReschedule, onDelete, onSend, onEdit, onCopyText}: Props) {
    const dispatch = useDispatch();
    const myChannelsMemberships = useSelector((state: GlobalState) => getMyChannelMemberships(state));
    const isAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));

    useEffect(() => {
        // this ensures the DM is loaded in redux store and is available
        // later when we check if the DM is with a deactivated user.
        if (channel?.type === Constants.DM_CHANNEL) {
            // fetchMissingChannels uses DataLoader which de-duplicates all requested data,
            // so even if we have multiple scheduled  posts in a DM,
            // the data loader ensured we fetch that DM only once.
            dispatch(fetchMissingChannels([channel.id]));
        }
    }, [channel, dispatch]);

    const handleReschedulePost = useCallback((schedulingInfo: SchedulingInfo) => {
        onReschedule(schedulingInfo.scheduled_at);
    }, [onReschedule]);

    const handleDelete = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.DELETE_DRAFT,
            dialogType: DeleteScheduledPostModal,
            dialogProps: {
                channelDisplayName: channel?.display_name,
                onConfirm: () => onDelete(scheduledPost.id),
            },
        }));
    }, [channel, dispatch, onDelete, scheduledPost.id]);

    const handleSend = useCallback(() => {
        if (!channel) {
            return;
        }

        dispatch(openModal({
            modalId: ModalIdentifiers.SEND_DRAFT,
            dialogType: SendDraftModal,
            dialogProps: {
                displayName: channel.display_name,
                onConfirm: () => onSend(scheduledPost.id),
            },
        }));
    }, [channel, dispatch, onSend, scheduledPost.id]);

    const userChannelMember = Boolean(channel && myChannelsMemberships[channel.id]);
    const isChannelArchived = Boolean(channel?.delete_at);

    const showEditOption = !scheduledPost.error_code && userChannelMember && !isChannelArchived;
    const isDeactivatedDM = useSelector((state: GlobalState) => isDeactivatedDirectChannel(state, scheduledPost.channel_id));
    const showSendNowOption = (!scheduledPost.error_code || scheduledPost.error_code === 'unknown' || scheduledPost.error_code === 'unable_to_send') && channel && !isChannelArchived && !isDeactivatedDM && userChannelMember;
    const showRescheduleOption = (!scheduledPost.error_code || scheduledPost.error_code === 'unknown' || scheduledPost.error_code === 'unable_to_send') && userChannelMember && !isChannelArchived;

    return (
        <div className='ScheduledPostActions'>
            <Action
                icon='icon-trash-can-outline'
                id='delete'
                name='delete'
                tooltipText={deleteTooltipText}
                onClick={handleDelete}
            />

            {
                (isAdmin || showEditOption) &&
                <Action
                    icon='icon-pencil-outline'
                    id='edit'
                    name='edit'
                    tooltipText={editTooltipText}
                    onClick={onEdit}

                />
            }

            <Action
                icon='icon-content-copy'
                id='copy_text'
                name='copy_text'
                tooltipText={copyTextTooltipText}
                onClick={onCopyText}
            />

            {
                (isAdmin || showRescheduleOption) &&
                <div className='DraftAction'>
                    <SendPostOptions
                        disabled={false}
                        onSelect={handleReschedulePost}
                        channelId={channel!.id}
                        transformOriginVertical='top'
                        anchorOrigin='bottom'
                        menuIcon={(
                            <i
                                className={classNames(
                                    'icon',
                                    'icon-clock-send-outline',
                                )}
                            />
                        )}
                        menuButtonClassName='DraftAction__button'
                    />
                </div>

            }

            {
                (isAdmin || showSendNowOption) &&
                <Action
                    icon='icon-send-outline'
                    id='sendNow'
                    name='sendNow'
                    tooltipText={sendNowTooltipText}
                    onClick={handleSend}
                />
            }
        </div>
    );
}

export default memo(ScheduledPostActions);
