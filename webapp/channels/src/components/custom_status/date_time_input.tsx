// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import IconButton from '@infomaniak/compass-components/components/icon-button';
import classNames from 'classnames';
import {DateTime} from 'luxon';
import type {Moment} from 'moment-timezone';
import moment from 'moment-timezone';
import type {CSSProperties} from 'react';
import React, {useEffect, useState} from 'react';
import type {DayPickerProps} from 'react-day-picker';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {components} from 'react-select';
import type {ActionMeta, ValueType, ControlProps, OptionsType} from 'react-select';
import Creatable from 'react-select/creatable';

import {getCurrentLocale} from 'selectors/i18n';

import DatePicker from 'components/date_picker';
import Timestamp from 'components/timestamp';
import Input from 'components/widgets/inputs/input/input';

import Constants from 'utils/constants';
import {getCurrentMomentForTimezone} from 'utils/timezone';
import {isKeyPressed, localizeMessage} from 'utils/utils';

import './date_time_input.scss';

const CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES = 30;

type CreatableOption = {
    value: Date | string;
    label: JSX.Element;
};

const CreatableControl = ({children, ...props}: ControlProps<CreatableOption>) => (
    <components.Control {...props}>
        <span className='dateTime__input-title'>
            <FormattedMessage
                id='custom_status.expiry.time_picker.title'
                defaultMessage='Time'
            />
        </span>
        <span className='dateTime__custom-time-icon'>
            <i className='icon-clock-outline'/>
        </span>
        {children}
    </components.Control>
);

export function getRoundedTime(value: Moment) {
    const roundedTo = CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES;
    const start = moment(value);
    const diff = start.minute() % roundedTo;
    if (diff === 0) {
        return value;
    }
    const remainder = roundedTo - diff;
    return start.add(remainder, 'm').seconds(0).milliseconds(0);
}

const getTimeInIntervals = (startTime: Moment): CreatableOption[] => {
    const interval = CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES;
    let time = moment(startTime);
    const nextDay = moment(startTime).add(1, 'days').startOf('day');
    const intervals: CreatableOption[] = [];
    while (time.isBefore(nextDay)) {
        const date = time.toDate();
        intervals.push({
            value: date,
            label: (
                <Timestamp
                    useRelative={false}
                    useDate={false}
                    value={date}
                />
            ),
        });
        time = time.add(interval, 'minutes').seconds(0).milliseconds(0);
    }

    return intervals;
};

const setDateTime = (initialDate: Moment, newTime: string) => moment(newTime, 'HH:mm').
    day(initialDate.day()).
    month(initialDate.month()).
    year(initialDate.year());

const styles = {
    control: (css: CSSProperties) => ({
        ...css,
        minHeight: '40px',
        background: 'var(--center-channel-bg)',
        border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
        boxShadow: 'none',
        '&:hover': {
            border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
        },
        '&:focus-within': {
            border: '1px solid var(--button-bg)',
            boxShadow: 'rgba(0, 152, 255, 0.5) 0px 0px 1px 2px, rgb(0, 152, 255) 0px 0px 0px 1px',
        },
    }),
    singleValue: (css: CSSProperties) => ({
        ...css,
        color: 'var(--center-channel-color)',
    }),
    indicatorSeparator: (style: CSSProperties) => ({
        ...style,
        display: 'none',
    }),
    menu: (style: CSSProperties) => ({
        ...style,
        zIndex: 1000,
    }),
};

type Props = {
    time: Moment;
    handleChange: (date: Moment) => void;
    timezone?: string;
    setIsDatePickerOpen?: (isDatePickerOpen: boolean) => void;
    onMenuChange: (open: boolean) => void;
}

const DateTimeInputContainer: React.FC<Props> = ({time, handleChange, timezone, onMenuChange, setIsDatePickerOpen}: Props) => {
    const locale = useSelector(getCurrentLocale);
    const [timeOptions, setTimeOptions] = useState<CreatableOption[]>([]);
    const [selectedValue, setSelectedValue] = useState<ValueType<CreatableOption>>(null);
    const [isPopperOpen, setIsPopperOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {formatMessage} = useIntl();

    const handlePopperOpenState = (isOpen: boolean) => {
        setIsPopperOpen(isOpen);
        setIsDatePickerOpen?.(isOpen);
    };

    const handleMenuOpenState = (isOpen: boolean) => {
        setIsMenuOpen(isOpen);
        onMenuChange(isOpen);
    };

    const handleKeyDown = (e: React.KeyboardEvent, open: boolean, setter: (open: boolean) => void) => {
        if (!open && isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            e.preventDefault();
            e.stopPropagation();
            setter(true);
        }
        if (open && isKeyPressed(e, Constants.KeyCodes.ESCAPE)) {
            e.preventDefault();
            e.stopPropagation();
            setter(false);
        }
    };

    const setTimeAndOptions = () => {
        const currentTime = getCurrentMomentForTimezone(timezone);
        let startTime = moment(time).startOf('day');
        if (time.dayOfYear() === currentTime.dayOfYear() && time.year() === currentTime.year()) {
            startTime = getRoundedTime(currentTime);
        }
        setTimeOptions(getTimeInIntervals(startTime));
    };

    useEffect(setTimeAndOptions, [time]);

    const handleDayChange = (day: Date) => {
        const currentMoment = getCurrentMomentForTimezone(timezone);
        const dayWithTimezone = timezone ? moment.tz(day, timezone) : moment(day);
        if (dayWithTimezone.isBefore(currentMoment)) {
            const roundedTime = getRoundedTime(currentMoment);
            const newOptions = getTimeInIntervals(roundedTime);
            if (newOptions.length) {
                setSelectedValue(newOptions[0]);
            }
            handleChange(roundedTime);
        } else {
            const newMoment = time.clone().dayOfYear(dayWithTimezone.dayOfYear()).year(dayWithTimezone.year());
            handleChange(newMoment);
        }
        handlePopperOpenState(false);
    };

    const currentTime = getCurrentMomentForTimezone(timezone).toDate();

    const formatDate = (date: Date): string => {
        return DateTime.fromJSDate(date).toLocaleString({
            ...DateTime.DATE_SHORT,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const inputIcon = (
        <IconButton
            onClick={() => handlePopperOpenState(!isPopperOpen)}
            icon={'calendar-outline'}
            className='dateTime__calendar-icon'
            size={'sm'}
            aria-haspopup='grid'
            tabIndex={-1}
        />
    );

    const datePickerProps: DayPickerProps = {
        initialFocus: isPopperOpen,
        mode: 'single',
        selected: time.toDate(),
        defaultMonth: time.toDate(),
        onDayClick: handleDayChange,
        disabled: [{
            before: currentTime,
        }],
        showOutsideDays: true,
    };

    const isValidNewOption = (inputValue: string, _values: ValueType<CreatableOption>, options: OptionsType<CreatableOption>) => {
        const timeOption = moment(inputValue, 'HH:mm').day(time.day()).month(time.month()).year(time.year());
        const isValid = timeOption.isValid() && timeOption.isAfter(moment.now());
        const alreadyExists = options.some((option) => moment(option.value).isSame(timeOption));
        return isValid && !alreadyExists;
    };

    const handleTimeChange = (newOption: ValueType<CreatableOption>, {action}: ActionMeta<CreatableOption>) => {
        if (!newOption || !('value' in newOption)) {
            return;
        }
        const {value} = newOption;
        let newTime = moment(value);
        if (action === 'create-option' && typeof value === 'string') {
            newTime = setDateTime(time, value);
        }
        if (newTime.isValid()) {
            setSelectedValue(newOption);
            handleChange(newTime);
        }
    };

    const formatOptionLabel = (option: CreatableOption) => {
        const {value, label} = option;
        if (typeof value === 'string') {
            const newValue = setDateTime(time, value).toDate();
            return (
                <Timestamp
                    useRelative={false}
                    useDate={false}
                    value={newValue}
                />
            );
        }
        return label;
    };

    const noOptionsMessage = () => formatMessage({
        id: 'custom_reminder.time_picker.no_option',
        defaultMessage: 'Invalid date',
    });

    const placeholder = (
        <Timestamp
            useRelative={false}
            useDate={false}
            value={time.toDate()}
        />
    );

    return (
        <div>
            <div className='dateTime' >
                <div
                    className={classNames('dateTime__date', {'dateTime__date-open': isPopperOpen})}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, isPopperOpen, handlePopperOpenState)}
                >
                    <DatePicker
                        isPopperOpen={isPopperOpen}
                        handlePopperOpenState={handlePopperOpenState}
                        locale={locale}
                        datePickerProps={datePickerProps}
                    >
                        <Input
                            value={formatDate(time.toDate())}
                            id='dateTime__calendar-input'
                            readOnly={true}
                            className='dateTime__calendar-input'
                            label={localizeMessage('dnd_custom_time_picker_modal.date', 'Date')}
                            onClick={() => handlePopperOpenState(!isPopperOpen)}
                            tabIndex={-1}
                            inputPrefix={inputIcon}
                        />
                    </DatePicker>
                </div>
                <div className='dateTime__custom-time'>
                    <Creatable
                        components={{Control: CreatableControl}}
                        classNamePrefix='react-select'
                        options={timeOptions}
                        value={selectedValue}
                        menuIsOpen={isMenuOpen}
                        onChange={handleTimeChange}
                        formatOptionLabel={formatOptionLabel}
                        isValidNewOption={isValidNewOption}
                        onMenuOpen={() => handleMenuOpenState(true)}
                        onMenuClose={() => handleMenuOpenState(false)}
                        noOptionsMessage={noOptionsMessage}
                        onKeyDown={(e) => handleKeyDown(e, isMenuOpen, handleMenuOpenState)}
                        placeholder={placeholder}
                        styles={styles}
                    />
                </div>
            </div>
            <span className='dateTime__description'>
                <FormattedMessage
                    id='custom_status.expiry.time_picker.description'
                    defaultMessage='To add a more precise time, input your desired time, and it will be added as a selectable option.'
                />
            </span>
        </div>
    );
};

export default DateTimeInputContainer;
