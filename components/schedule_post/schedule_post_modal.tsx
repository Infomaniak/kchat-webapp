// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';
import {Moment} from 'moment-timezone';

import {closeModal} from 'actions/views/modals';

import GenericModal from 'components/generic_modal';
import DateTimeInput, {getRoundedTime} from 'components/custom_status/date_time_input';
import SchedulePostRepeatActions, {SchedulePostOptions} from 'components/schedule_post/schedule_post_repeat_actions';

import {ModalIdentifiers} from 'utils/constants';

import './schedule_post_modal.scss';

type Props = {
    timestamp: Moment;
    timezone?: string;
    onConfirm: (date: Date, options?: SchedulePostOptions) => void;
}

const SchedulePostModal = ({timestamp, timezone, onConfirm}: Props) => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const [scheduleTimestamp, setScheduleTimestamp] = useState<Moment>(getRoundedTime(timestamp));
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
    const [isRepeatChecked, setIsRepeatChecked] = useState<boolean>(false);
    const [areRepeatOptionsValid, setAreRepeatOptionsValid] = useState<boolean>(true);
    const [schedulePostOptions, setSchedulePostOptions] = useState<SchedulePostOptions>({
        everyAmount: 1,
        everyInterval: 'week',
        everyMonth: 'date',
        daySelected: {},
        endRadioSelected: 'never',
        endMoment: getRoundedTime(timestamp),
        isEndDatePickerOpen: false,
    });

    const handleConfirm = () => {
        if (isRepeatChecked) {
            onConfirm(scheduleTimestamp.toDate(), schedulePostOptions);
        }
        onConfirm(scheduleTimestamp.toDate());
    };

    const handleRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsRepeatChecked(e.target.checked);
    };

    const handleExit = () => dispatch(closeModal(ModalIdentifiers.SCHEDULE_POST));

    const handleRepeatOptionsValidation = (isValid: boolean) => {
        if (areRepeatOptionsValid !== isValid) {
            setAreRepeatOptionsValid(isValid);
        }
    };

    const handleRepeatOptionsChange = (newOptions: Partial<SchedulePostOptions>) => setSchedulePostOptions({...schedulePostOptions, ...newOptions});

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

    const repeatCheckboxLabel = formatMessage({
        id: 'create_post.schedule_post.modal.repeat.checkbox',
        defaultMessage: 'Repeat',
    });

    const isConfirmDisabled = isMenuOpen || isDatePickerOpen || schedulePostOptions.isEndDatePickerOpen || (isRepeatChecked && !areRepeatOptionsValid);

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
            <div className='schedule-post-modal__repeat-checkbox'>
                <label>
                    <input
                        type='checkbox'
                        checked={isRepeatChecked}
                        onChange={handleRepeatChange}
                    />
                    {repeatCheckboxLabel}
                </label>
            </div>
            <SchedulePostRepeatActions
                show={isRepeatChecked}
                timestamp={scheduleTimestamp}
                timezone={timezone}
                setAreRepeatOptionsValid={handleRepeatOptionsValidation}
                schedulePostOptions={schedulePostOptions}
                setSchedulePostOptions={handleRepeatOptionsChange}
            />
        </GenericModal>
    );
};

export default SchedulePostModal;
