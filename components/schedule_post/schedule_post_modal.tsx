// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';
import {Moment} from 'moment-timezone';
import classNames from 'classnames';

import {closeModal} from 'actions/views/modals';

import GenericModal from 'components/generic_modal';
import DateTimeInput, {getRoundedTime} from 'components/custom_status/date_time_input';

import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnix} from 'utils/datetime';
import {getCurrentMomentForTimezone} from 'utils/timezone';

import './schedule_post_modal.scss';

type Props = {
    timestamp: Moment;
    timezone?: string;
    isScheduledDraft?: boolean;
    onConfirm: (scheduleUTCTimestamp: number) => void;
    onDelete?: () => void;
}

const SchedulePostModal = ({
    timestamp,
    timezone,
    isScheduledDraft = false,
    onConfirm,
    onDelete,
}: Props) => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const [scheduleTimestamp, setScheduleTimestamp] = useState<Moment>(isScheduledDraft ? timestamp : getRoundedTime(timestamp));
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

    const handleRemoveSchedule = () => {
        onDelete?.();
        handleExit();
    };

    const handleExit = () => dispatch(closeModal(ModalIdentifiers.SCHEDULE_POST));

    const handleConfirm = (close?: boolean) => {
        const currentMoment = getCurrentMomentForTimezone(timezone).add(1, 'minute');
        const scheduleMoment = scheduleTimestamp.isBefore(currentMoment) ? currentMoment : scheduleTimestamp;
        onConfirm(toUTCUnix(scheduleMoment.toDate()));
        if (close) {
            handleExit();
        }
    };

    const modalHeaderText = (
        <div>
            <h1>
                {formatMessage({
                    id: 'create_post.schedule_post.modal.header',
                    defaultMessage: 'Schedule draft',
                })}
            </h1>
            {timezone && <span>{timezone}</span>}
        </div>
    );

    const removeScheduleButtonText = formatMessage({
        id: 'create_post.schedule_post.modal.remove_schedule',
        defaultMessage: 'Remove schedule',
    });

    const cancelButtonText = formatMessage({
        id: 'generic_modal.cancel',
        defaultMessage: 'Cancel',
    });

    const confirmButtonText = formatMessage({
        id: 'create_post.schedule_post.modal.confirm',
        defaultMessage: 'Schedule',
    });

    const isConfirmDisabled = isMenuOpen || isDatePickerOpen;

    let footer;
    if (isScheduledDraft) {
        footer = (
            <>
                <button
                    type='button'
                    className='GenericModal__button delete'
                    onClick={handleRemoveSchedule}
                >
                    {removeScheduleButtonText}
                </button>
                <div>
                    <button
                        type='button'
                        className='GenericModal__button cancel secondary'
                        onClick={handleExit}
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        type='submit'
                        className={classNames('GenericModal__button confirm', {
                            disabled: isConfirmDisabled,
                        })}
                        onClick={() => handleConfirm(true)}
                        disabled={isConfirmDisabled}
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </>
        );
    }

    return (
        <GenericModal
            className='schedule-post-modal'
            modalHeaderText={modalHeaderText}
            confirmButtonText={confirmButtonText}
            isConfirmDisabled={isConfirmDisabled}
            autoCloseOnEnterKeyDown={false}
            enforceFocus={false}
            handleConfirm={handleConfirm}
            handleCancel={handleExit}
            onExited={handleExit}
            footer={footer}
        >
            <DateTimeInput
                time={scheduleTimestamp}
                handleChange={setScheduleTimestamp}
                timezone={timezone}
                onMenuChange={setIsMenuOpen}
                setIsDatePickerOpen={setIsDatePickerOpen}
            />
        </GenericModal>
    );
};

export default SchedulePostModal;
