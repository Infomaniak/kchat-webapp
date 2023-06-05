// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, useCallback, CSSProperties} from 'react';
import {useSelector} from 'react-redux';
import {DayModifiers, DayPickerProps} from 'react-day-picker';
import {FormattedMessage, useIntl} from 'react-intl';
import {components} from 'react-select';
import Creatable from 'react-select/creatable';
import type {ActionMeta, ValueType, ControlProps, OptionsType} from 'react-select';
import {DateTime} from 'luxon';

import moment, {Moment} from 'moment-timezone';

import IconButton from '@infomaniak/compass-components/components/icon-button';

import Input from 'components/widgets/inputs/input/input';
import DatePicker from 'components/date_picker';
import Timestamp from 'components/timestamp';
import {getCurrentLocale} from 'selectors/i18n';
import {isKeyPressed, localizeMessage} from 'utils/utils';
import {getCurrentMomentForTimezone} from 'utils/timezone';
import Constants from 'utils/constants';

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
        border: '2px solid var(--button-bg)',
        boxShadow: 'none',
        '&:hover': {
            border: '2px solid var(--button-bg)',
        },
        '&:focus': {
            border: '2px solid var(--button-bg)',
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

const placeholder = (
    <FormattedMessage
        id='time_dropdown.choose_time'
        defaultMessage='Choose a time'
    />
);

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
    const [isPopperOpen, setIsPopperOpen] = useState(false);
    const {formatMessage} = useIntl();

    const handlePopperOpenState = useCallback((isOpen: boolean) => {
        setIsPopperOpen(isOpen);
        setIsDatePickerOpen?.(isOpen);
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (isKeyPressed(event, Constants.KeyCodes.ESCAPE) && isPopperOpen) {
            handlePopperOpenState(false);
        }
    }, [isPopperOpen, handlePopperOpenState]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const setTimeAndOptions = () => {
        const currentTime = getCurrentMomentForTimezone(timezone);
        let startTime = moment(time).startOf('day');
        if (time.date() === currentTime.date()) {
            startTime = getRoundedTime(currentTime);
        }
        setTimeOptions(getTimeInIntervals(startTime));
    };

    useEffect(setTimeAndOptions, [time]);

    const handleDayChange = (day: Date, modifiers: DayModifiers) => {
        if (modifiers.today) {
            const currentTime = getCurrentMomentForTimezone(timezone);
            const roundedTime = getRoundedTime(currentTime);
            handleChange(roundedTime);
        } else {
            const dayWithTimezone = timezone ? moment.tz(day, timezone) : moment(day);
            handleChange(dayWithTimezone.startOf('day'));
        }
        handlePopperOpenState(false);
    };

    const currentTime = getCurrentMomentForTimezone(timezone).toDate();

    const formatDate = (date: Date): string => {
        return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
    };

    const inputIcon = (
        <IconButton
            onClick={() => handlePopperOpenState(!isPopperOpen)}
            icon={'calendar-outline'}
            className='dateTime__calendar-icon'
            size={'sm'}
            aria-haspopup='grid'
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

    const defaultTimeValue = {
        value: time.toDate(),
        label: (
            <Timestamp
                useRelative={false}
                useDate={false}
                value={time.toDate()}
            />
        ),
    };

    return (
        <div>
            <div className='dateTime'>
                <div className='dateTime__date'>
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
                        defaultValue={defaultTimeValue}
                        onChange={handleTimeChange}
                        formatOptionLabel={formatOptionLabel}
                        isValidNewOption={isValidNewOption}
                        onMenuOpen={() => onMenuChange(true)}
                        onMenuClose={() => onMenuChange(false)}
                        noOptionsMessage={noOptionsMessage}
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
