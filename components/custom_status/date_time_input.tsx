// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, useCallback, CSSProperties} from 'react';
import {useSelector} from 'react-redux';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {DayModifiers, NavbarElementProps} from 'react-day-picker';
import {FormattedMessage, useIntl} from 'react-intl';
import Creatable from 'react-select/Creatable';
import {components} from 'react-select';
import type {ActionMeta, ValueType, ControlProps, OptionsType} from 'react-select';

import moment, {Moment} from 'moment-timezone';
import MomentUtils from 'react-day-picker/moment';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import Timestamp from 'components/timestamp';
import {getCurrentLocale} from 'selectors/i18n';
import {getCurrentMomentForTimezone} from 'utils/timezone';

const CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES = 30;

type CreatableOption = {
    value: Date;
    label: JSX.Element;
};

const styles = {
    control: (css: CSSProperties) => ({
        ...css,
        minHeight: '40px',
    }),
};

const Navbar: React.FC<Partial<NavbarElementProps>> = (navbarProps: Partial<NavbarElementProps>) => {
    const {
        onPreviousClick,
        onNextClick,
        className,
    } = navbarProps;
    const styleLeft: React.CSSProperties = {
        float: 'left',
        fontSize: 18,
    };
    const styleRight: React.CSSProperties = {
        float: 'right',
        fontSize: 18,
    };

    return (
        <div className={className}>
            <button
                className='style--none'
                style={styleLeft}
                onClick={(e) => {
                    e.preventDefault();
                    if (onPreviousClick) {
                        onPreviousClick();
                    }
                }}
            >
                <i
                    className='fa fa-angle-left'
                    aria-hidden='true'
                />
            </button>
            <button
                className='style--none'
                style={styleRight}
                onClick={(e) => {
                    e.preventDefault();
                    if (onNextClick) {
                        onNextClick();
                    }
                }}
            >
                <i
                    className='fa fa-angle-right'
                    aria-hidden='true'
                />
            </button>
        </div>
    );
};

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

const getTimeInIntervals = (startTime: Moment): Date[] => {
    const interval = CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES;
    let time = moment(startTime);
    const nextDay = moment(startTime).add(1, 'days').startOf('day');
    const intervals: Date[] = [];
    while (time.isBefore(nextDay)) {
        intervals.push(time.toDate());
        time = time.add(interval, 'minutes').seconds(0).milliseconds(0);
    }

    return intervals;
};

type Props = {
    time: Moment;
    handleChange: (date: Moment) => void;
    timezone?: string;
    onMenuChange: (open: boolean) => void;
}

const DateTimeInputContainer: React.FC<Props> = ({time, handleChange, timezone, onMenuChange}: Props) => {
    const locale = useSelector(getCurrentLocale);
    const [timeOptions, setTimeOptions] = useState<Date[]>([]);
    const {formatMessage} = useIntl();

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
    };

    const handleTimeChange = useCallback((time: Date, e: React.MouseEvent) => {
        e.preventDefault();
        handleChange(moment(time));
    }, [handleChange]);

    const isValidNewOption = (inputValue: string, _values: ValueType<CreatableOption>, options: OptionsType<CreatableOption>) => {
        const timeOption = moment(inputValue, 'HH:mm').day(time.day()).month(time.month()).year(time.year());
        const isValid = timeOption.isValid() && timeOption.isAfter(moment.now());
        const alreadyExists = options.some((option) => moment(option.value).isSame(timeOption));
        return isValid && !alreadyExists;
    };

    const currentTime = getCurrentMomentForTimezone(timezone).toDate();
    const modifiers = {
        today: currentTime,
    };

    const onChange = (newOption: ValueType<CreatableOption>, {action}: ActionMeta<CreatableOption>) => {
        if (!newOption || !('value' in newOption)) {
            return;
        }
        const {value} = newOption;
        let newTime = moment(value);
        if (action === 'create-option') {
            newTime = moment(value, 'HH:mm').day(time.day()).month(time.month()).year(time.year());
        }
        if (newTime.isValid()) {
            handleChange(newTime);
        }
    };

    const noOptionsMessage = () => formatMessage({
        id: 'custom_reminder.time_picker.no_option',
        defaultMessage: 'Non valid date',
    });

    const formatCreateLabel = (inputValue: string) => {
        const timeOption = moment(inputValue, 'HH:mm').day(time.day()).month(time.month()).year(time.year()).toDate();
        return (
            <Timestamp
                useRelative={false}
                useDate={false}
                value={timeOption}
            />
        );
    };

    const placeholder = formatMessage({
        id: 'time_dropdown.choose_time',
        defaultMessage: 'Choose a time',
    });

    const creatableTimeOptions = timeOptions.map((timeOption: Date) => ({
        value: timeOption,
        label: (
            <Timestamp
                useRelative={false}
                useDate={false}
                value={timeOption}
            />
        ),
    }));

    return (
        <div className='dateTime'>
            <div className='dateTime__date'>
                <span className='dateTime__input-title'>{formatMessage({id: 'custom_status.expiry.date_picker.title', defaultMessage: 'Date'})}</span>
                <span className='dateTime__date-icon'>
                    <i className='icon-calendar-outline'/>
                </span>
                <DayPickerInput
                    value={time.toDate()}
                    format='yyyy-MM-DD'
                    formatDate={MomentUtils.formatDate}
                    onDayChange={handleDayChange}
                    inputProps={{
                        readOnly: true,
                        className: 'dateTime__input',
                    }}
                    dayPickerProps={{
                        navbarElement: <Navbar/>,
                        fromMonth: currentTime,
                        modifiers,
                        localeUtils: MomentUtils,
                        locale: locale.toLowerCase(),
                        disabledDays: {
                            before: currentTime,
                        },
                    }}
                />
            </div>
            {/* <div className='dateTime__time'>
                <MenuWrapper
                    className='dateTime__time-menu'
                >
                    <div>
                        <span className='dateTime__input-title'>{formatMessage({id: 'custom_status.expiry.time_picker.title', defaultMessage: 'Time'})}</span>
                        <span className='dateTime__time-icon'>
                            <i className='icon-clock-outline'/>
                        </span>
                        <div
                            className='dateTime__input'
                        >
                            <Timestamp
                                useRelative={false}
                                useDate={false}
                                value={time.toString()}
                            />
                        </div>
                    </div>
                    <Menu
                        ariaLabel={formatMessage({id: 'time_dropdown.choose_time', defaultMessage: 'Choose a time'})}
                        id='expiryTimeMenu'
                    >
                        <Menu.Group>
                            {Array.isArray(timeOptions) && timeOptions.map((option, index) => (
                                <Menu.ItemAction
                                    onClick={handleTimeChange.bind(this, option)}
                                    key={index}
                                    text={
                                        <Timestamp
                                            useRelative={false}
                                            useDate={false}
                                            value={option}
                                        />
                                    }
                                />
                            ))}
                        </Menu.Group>
                    </Menu>
                </MenuWrapper>
            </div> */}
            <div className='dateTime__custom-time'>
                <Creatable
                    className='dateTime__custom-time-creatable'
                    components={{Control: CreatableControl}}
                    options={creatableTimeOptions}
                    onChange={onChange}
                    isValidNewOption={isValidNewOption}
                    onMenuOpen={() => onMenuChange(true)}
                    onMenuClose={() => onMenuChange(false)}
                    formatCreateLabel={formatCreateLabel}
                    noOptionsMessage={noOptionsMessage}
                    placeholder={placeholder}
                    styles={styles}
                />
            </div>
        </div>
    );
};

const CreatableControl = (props: ControlProps<CreatableOption>) => (
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
        {props.children}
    </components.Control>
);

export default DateTimeInputContainer;
