// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {Moment} from 'moment-timezone';

import {schedulePost} from 'mattermost-redux/actions/posts';

import GenericModal from 'components/generic_modal';
import DateTimeInput, {getRoundedTime} from 'components/custom_status/date_time_input';

import {toUTCUnix} from 'utils/datetime';

import './schedule_post_modal.scss';

type Props = {
    channelId: string;
    message: string;
    timestamp: Moment;
    timezone: string | undefined;
}

const SchedulePostModal = ({channelId, message, timestamp, timezone}: Props) => {
    const dispatch = useDispatch();
    const [scheduleTimestamp, setScheduleTimestamp] = useState<Moment>(getRoundedTime(timestamp));
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

    const handleConfirm = () => dispatch(schedulePost(channelId, message, toUTCUnix(scheduleTimestamp.toDate())));

    const isConfirmDisabled = isMenuOpen || isDatePickerOpen;

    return (
        <GenericModal
            className='schedule-post-modal'
            isConfirmDisabled={isConfirmDisabled}
            handleConfirm={handleConfirm}
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
