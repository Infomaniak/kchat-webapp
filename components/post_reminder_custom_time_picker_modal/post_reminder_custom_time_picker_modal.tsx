// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {Moment} from 'moment-timezone';

import GenericModal from 'components/generic_modal';
import {isKeyPressed, localizeMessage} from 'utils/utils';
import DateTimeInput, {getRoundedTime} from 'components/custom_status/date_time_input';

import {toUTCUnix} from 'utils/datetime';
import {getCurrentMomentForTimezone} from 'utils/timezone';
import Constants from 'utils/constants';

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
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (isKeyPressed(event, Constants.KeyCodes.ESCAPE) && !isDatePickerOpen && !isMenuOpen) {
            onExited();
        }
    }, [isDatePickerOpen, onExited]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleConfirm = useCallback(() => {
        actions.addPostReminder(userId, postId, toUTCUnix(customReminderTime.toDate()));
    }, [customReminderTime]);

    const isConfirmDisabled = isMenuOpen || isDatePickerOpen;

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
            keyboardEscape={false}
            isConfirmDisabled={isConfirmDisabled}
        >
            <DateTimeInput
                time={customReminderTime}
                handleChange={setCustomReminderTime}
                timezone={timezone}
                onMenuChange={setIsMenuOpen}
                setIsDatePickerOpen={setIsDatePickerOpen}
            />
        </GenericModal>
    );
}

export default PostReminderCustomTimePicker;
