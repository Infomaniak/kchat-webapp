// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';
import {Moment} from 'moment-timezone';

import {closeModal} from 'actions/views/modals';

import GenericModal from 'components/generic_modal';
import DateTimeInput, {getRoundedTime} from 'components/custom_status/date_time_input';

import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnix} from 'utils/datetime';

import './schedule_post_modal.scss';

type Props = {
    timestamp: Moment;
    timezone?: string;
    onConfirm: (scheduleUTCTimestamp: number) => void;
}

const SchedulePostModal = ({timestamp, timezone, onConfirm}: Props) => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const [scheduleTimestamp, setScheduleTimestamp] = useState<Moment>(getRoundedTime(timestamp));
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

    const handleConfirm = () => onConfirm(toUTCUnix(scheduleTimestamp.toDate()));

    const handleExit = () => dispatch(closeModal(ModalIdentifiers.SCHEDULE_POST));

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

    const confirmButtonText = formatMessage({
        id: 'create_post.schedule_post.modal.confirm',
        defaultMessage: 'Schedule',
    });

    const isConfirmDisabled = isMenuOpen || isDatePickerOpen;

    return (
        <GenericModal
            className='schedule-post-modal'
            modalHeaderText={modalHeaderText}
            confirmButtonText={confirmButtonText}
            isConfirmDisabled={isConfirmDisabled}
            handleConfirm={handleConfirm}
            handleCancel={handleExit}
            onExited={handleExit}
        >
            <DateTimeInput // TODO: remove border
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
