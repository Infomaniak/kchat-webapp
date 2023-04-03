// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Moment} from 'moment-timezone';

import GenericModal from 'components/generic_modal';
import {localizeMessage} from 'utils/utils';
import DateTimeInput, {getRoundedTime} from 'components/custom_status/date_time_input';

import {toUTCUnix} from 'utils/datetime';
import {getCurrentMomentForTimezone} from 'utils/timezone';

import {PropsFromRedux} from './index';

import './post_reminder_custom_time_picker_modal.scss';

type Props = PropsFromRedux & {
    onExited: () => void;
    postId: string;
};

const modalHeaderText = (
    <FormattedMessage
        id='post_reminder.custom_time_picker_modal.text'
        defaultMessage='Set a reminder'
    />
);
const confirmButtonText = (
    <FormattedMessage
        id='post_reminder.custom_time_picker_modal.text'
        defaultMessage='Set reminder'
    />
);

function PostReminderCustomTimePicker({userId, timezone, onExited, postId, actions}: Props) {
    const currentTime = getCurrentMomentForTimezone(timezone);
    const initialReminderTime: Moment = getRoundedTime(currentTime);
    const [customReminderTime, setCustomReminderTime] = useState<Moment>(initialReminderTime);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const handleConfirm = useCallback(() => {
        actions.addPostReminder(userId, postId, toUTCUnix(customReminderTime.toDate()));
    }, [customReminderTime]);

    return (
        <GenericModal
            ariaLabel={localizeMessage('post_reminder_custom_time_picker_modal.text', 'Set a reminder')}
            onExited={onExited}
            modalHeaderText={modalHeaderText}
            confirmButtonText={confirmButtonText}
            handleConfirm={handleConfirm}
            handleEnterKeyPress={handleConfirm}
            id='PostReminderCustomTimePickerModal'
            className={'post-reminder-modal'}
            compassDesign={true}
            enforceFocus={true}
            isConfirmDisabled={isMenuOpen}
        >
            <DateTimeInput
                time={customReminderTime}
                handleChange={setCustomReminderTime}
                timezone={timezone}
                onMenuChange={setIsMenuOpen}
            />
        </GenericModal>
    );
}

export default PostReminderCustomTimePicker;
