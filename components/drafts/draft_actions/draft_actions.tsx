// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';
import moment from 'moment-timezone';

import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {getCurrentMomentForTimezone} from 'utils/timezone';

import SchedulePostModal from 'components/schedule_post/schedule_post_modal';
import ScheduleIcon from 'components/widgets/icons/schedule_icon';

import Action from './action';
import SendDraftModal from './send_draft_modal';
import DeleteDraftModal from './delete_draft_modal';

type Props = {
    displayName: string;
    draftId: string;
    isInvalid: boolean;
    timezone?: string;
    isScheduled: boolean;
    scheduleTimestamp?: number;
    onDelete: (draftId: string) => void;
    onEdit: () => void;
    onSend: (draftId: string) => void;
    onSchedule: (scheduleUTCTimestamp: number) => void;
    onScheduleDelete: () => void;
};

function DraftActions({
    displayName,
    draftId,
    isInvalid,
    timezone,
    isScheduled,
    scheduleTimestamp,
    onDelete,
    onEdit,
    onSend,
    onSchedule,
    onScheduleDelete,
}: Props) {
    const dispatch = useDispatch();

    const handleDelete = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.DELETE_DRAFT,
            dialogType: DeleteDraftModal,
            dialogProps: {
                displayName,
                onConfirm: () => onDelete(draftId),
            },
        }));
    }, [displayName]);

    const handleSend = useCallback(() => {
        dispatch(openModal({
            modalId: ModalIdentifiers.SEND_DRAFT,
            dialogType: SendDraftModal,
            dialogProps: {
                displayName,
                onConfirm: () => onSend(draftId),
            },
        }));
    }, [displayName]);

    const handleSchedule = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.SCHEDULE_POST,
            dialogType: SchedulePostModal,
            dialogProps: {
                timestamp: scheduleTimestamp ? moment.unix(scheduleTimestamp) : getCurrentMomentForTimezone(timezone),
                timezone,
                isScheduledDraft: isScheduled,
                onConfirm: onSchedule,
                onDelete: onScheduleDelete,
            },
        }));
    };

    const deleteAction = (
        <Action
            icon='icon-trash-can-outline'
            id='delete'
            name='delete'
            tooltipText={(
                <FormattedMessage
                    id='drafts.actions.delete'
                    defaultMessage='Delete draft'
                />
            )}
            onClick={handleDelete}
        />
    );

    if (isInvalid) {
        return deleteAction;
    }

    return (
        <>
            {deleteAction}
            <Action
                icon='icon-pencil-outline'
                id='edit'
                name='edit'
                tooltipText={(
                    <FormattedMessage
                        id='drafts.actions.edit'
                        defaultMessage='Edit draft'
                    />
                )}
                onClick={onEdit}
            />
            <Action
                icon={ScheduleIcon}
                id='schedule'
                name='schedule'
                tooltipText={scheduleTimestamp ? (
                    <FormattedMessage
                        id='drafts.actions.reschedule'
                        defaultMessage='Reschedule draft'
                    />
                ) : (
                    <FormattedMessage
                        id='drafts.actions.schedule'
                        defaultMessage='Schedule draft'
                    />
                )}
                onClick={handleSchedule}
            />
            <Action
                icon='icon-send-outline'
                id='send'
                name='send'
                tooltipText={(
                    <FormattedMessage
                        id='drafts.actions.send'
                        defaultMessage='Send draft'
                    />
                )}
                onClick={handleSend}
            />
        </>
    );
}

export default memo(DraftActions);
