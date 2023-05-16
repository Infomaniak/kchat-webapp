// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import moment, {Moment} from 'moment-timezone';
import ReactSelect, {ValueType} from 'react-select';
import {DayPickerProps} from 'react-day-picker';
import IconButton from '@infomaniak/compass-components/components/icon-button';

import {getCurrentLocale} from 'selectors/i18n';

import {getRoundedTime} from 'components/custom_status/date_time_input';
import DatePicker from 'components/date_picker';
import Input, {CustomMessageInputType} from 'components/widgets/inputs/input/input';

import {ItemStatus} from 'utils/constants';

type Props = {
    show: boolean;
    timestamp: Moment;
    timezone?: string;
    isValidEveryAmount: boolean;
    setIsValidEveryAmount: (isValid: boolean) => void;
};

type SelectOption<K> = {
    value: K;
    label: {
        id: string;
        defaultMessage: string;
    };
}

type EveryIntervalOption = SelectOption<'day' | 'week' | 'month'>;

type EveryMonthOption = SelectOption<'weekday' | 'date'>;

type EndRadioOption = 'never' | 'on';

const everyIntervalOptions: EveryIntervalOption[] = [
    {value: 'day', label: {id: 'create_post.schedule_post.modal.repeat.every.day', defaultMessage: 'Day'}},
    {value: 'week', label: {id: 'create_post.schedule_post.modal.repeat.every.week', defaultMessage: 'Week'}},
    {value: 'month', label: {id: 'create_post.schedule_post.modal.repeat.every.month', defaultMessage: 'Month'}},
];

const everyMonthOptions: EveryMonthOption[] = [
    {value: 'date', label: {id: 'create_post.schedule_post.modal.repeat.every.date', defaultMessage: 'On the {date, select, 1 {{date, number}st} 2 {{date, number}nd} other {{date, number}th}}'}},
    {value: 'weekday', label: {id: 'create_post.schedule_post.modal.repeat.every.weekday', defaultMessage: 'On the 1st {day}'}},
];

const selectStyle = {
    indicatorSeparator: (style: React.CSSProperties) => ({
        ...style,
        display: 'none',
    }),
    menu: (style: React.CSSProperties) => ({
        ...style,
        zIndex: 1000,
    }),
};

const momentInstance = moment();

// TODO: improve theming support
const RepeatActions = ({show, timestamp, timezone, isValidEveryAmount, setIsValidEveryAmount}: Props) => {
    const locale = useSelector(getCurrentLocale);
    const {formatMessage, formatDate} = useIntl();
    const [everyAmount, setEveryAmount] = useState<number>(1);
    const [everyInterval, setEveryInterval] = useState<EveryIntervalOption['value']>('week');
    const [everyMonth, setEveryMonth] = useState<EveryMonthOption['value']>('date');
    const [daySelected, setDaySelected] = useState<Record<number, boolean>>({});
    const [endRadioSelected, setEndRadioSelected] = useState<EndRadioOption>('never');
    const [endMoment, setEndMoment] = useState<Moment>(getRoundedTime(timestamp));
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState<boolean>(false);

    useEffect(() => {
        if (endMoment.isBefore(timestamp)) {
            setEndMoment(timestamp);
        }
    }, [timestamp]);

    const handleDaySelection = (day: number) => setDaySelected({
        ...daySelected,
        [day]: !daySelected[day] ?? true,
    });

    const dayPicker = [];
    for (let i = 1; i <= 7; i++) {
        const dayInitial = formatDate(momentInstance.weekday(i).toDate(), {
            weekday: 'narrow',
            timeZone: timezone,
        });
        dayPicker.push(
            <button
                className={classNames('btn', {
                    'btn-primary': daySelected[i],
                    'btn-secondary': !daySelected[i],
                })}
                key={'schedule-post-repeat-day-' + i}
                onClick={() => handleDaySelection(i)}
            >
                {dayInitial}
            </button>,
        );
    }

    const handleEveryAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.currentTarget.value, 10);
        const isValid = Boolean(value);
        setEveryAmount(value);
        if (isValidEveryAmount !== isValid) {
            setIsValidEveryAmount(isValid);
        }
    };

    let everyAmountCustomMessage: CustomMessageInputType = null;
    if (!isValidEveryAmount) {
        everyAmountCustomMessage = {
            type: ItemStatus.ERROR,
            value: formatMessage({
                id: 'create_post.schedule_post.modal.repeat.every.amount_invalid',
                defaultMessage: 'Enter a valid number',
            }),
        };
    }

    const everyAmountInput = (
        <Input
            containerClassName='schedule-every-amount'
            className='schedule-every-amount__fieldset'
            inputClassName='schedule-every-amount__input'
            onChange={handleEveryAmountChange}
            value={everyAmount}
            type='number'
            hasError={!isValidEveryAmount} // TODO: fix blur issue / placement
            customMessage={everyAmountCustomMessage}
        />
    );

    const handleEveryIntervalChange = (option: ValueType<EveryIntervalOption>) => {
        if (!option || !('value' in option)) {
            return;
        }
        setEveryInterval(option.value);
        setDaySelected({});
    };

    const formatEveryIntervalOptionLabel = (option: EveryIntervalOption) => formatMessage(option.label);

    const everyIntervalSelect = (
        <ReactSelect
            className='schedule-every-interval-select react-select'
            classNamePrefix='react-select'
            isClearable={false}
            isSearchable={false}
            options={everyIntervalOptions}
            value={everyIntervalOptions.find((option) => option.value === everyInterval)}
            onChange={handleEveryIntervalChange}
            formatOptionLabel={formatEveryIntervalOptionLabel}
            styles={selectStyle}
        />
    );

    const handleEveryMonthChange = (option: ValueType<EveryMonthOption>) => {
        if (!option || !('value' in option)) {
            return;
        }
        setEveryMonth(option.value);
    };

    const formatEveryMonthOptionLabel = (option: EveryMonthOption) => {
        const values: Record<string, string | number> = {};
        switch (option.value) {
        case 'date':
            values.date = timestamp.date();
            break;
        case 'weekday':
            values.day = formatDate(timestamp.toDate(), {
                weekday: 'long',
                timeZone: timezone,
            });
            break;
        }
        return formatMessage(option.label, values);
    };

    const everyMonthSelect = (
        <ReactSelect
            className='schedule-every-month-select react-select'
            classNamePrefix='react-select'
            isClearable={false}
            isSearchable={false}
            options={everyMonthOptions}
            value={everyMonthOptions.find((option: EveryMonthOption) => option.value === everyMonth)}
            onChange={handleEveryMonthChange}
            formatOptionLabel={formatEveryMonthOptionLabel}
            styles={selectStyle}
        />
    );

    const handleEndDateChange = (date: Date) => {
        const time = timezone ? moment.tz(date, timezone) : moment(date);
        setEndMoment(time.startOf('day'));
        setIsEndDatePickerOpen(false);
    };

    const datePickerProps: DayPickerProps = {
        initialFocus: isEndDatePickerOpen,
        mode: 'single',
        selected: endMoment.toDate(),
        onDayClick: handleEndDateChange,
        disabled: [{
            before: timestamp.toDate(),
        }],
        showOutsideDays: true,
    };

    const isEndDatePickerDisabled = endRadioSelected !== 'on';

    const toggleEndDatePicker = () => {
        if (!isEndDatePickerDisabled) {
            setIsEndDatePickerOpen(true);
        }
    };

    const endRadio = (
        <div className='schedule-ends-radio'>
            <div>
                <input
                    type='radio'
                    checked={endRadioSelected === 'never'}
                    onChange={() => setEndRadioSelected('never')}
                />
                <label>
                    {formatMessage({
                        id: 'create_post.schedule_post.modal.repeat.ends.never',
                        defaultMessage: 'Never',
                    })}
                </label>
            </div>
            <div>
                <input
                    type='radio'
                    checked={endRadioSelected === 'on'}
                    onChange={() => setEndRadioSelected('on')}
                />
                <label>
                    {formatMessage({
                        id: 'create_post.schedule_post.modal.repeat.ends.on',
                        defaultMessage: 'On',
                    })}
                </label>
                <DatePicker
                    isPopperOpen={isEndDatePickerOpen}
                    handlePopperOpenState={setIsEndDatePickerOpen}
                    locale={locale}
                    datePickerProps={datePickerProps}
                >
                    <Input
                        value={endMoment.format('YYYY-MM-DD')}
                        readOnly={true}
                        containerClassName='schedule-ends-date-picker'
                        className='schedule-ends-date-picker__fieldset'
                        inputClassName='schedule-ends-date-picker__input'
                        label={formatMessage({
                            id: 'dnd_custom_time_picker_modal.date',
                            defaultMessage: 'Date',
                        })}
                        onClick={toggleEndDatePicker}
                        tabIndex={-1}
                        disabled={isEndDatePickerDisabled}
                        inputPrefix={(
                            <IconButton
                                onClick={toggleEndDatePicker}
                                icon={'calendar-outline'}
                                className='schedule-ends-date-picker__icon'
                                size={'sm'}
                                aria-haspopup='grid'
                            />
                        )}
                    />
                </DatePicker>
            </div>
        </div>
    );

    const repeatEveryLabel = formatMessage({
        id: 'create_post.schedule_post.modal.repeat.every',
        defaultMessage: 'Repeat every',
    });

    const repeatOnLabel = formatMessage({
        id: 'create_post.schedule_post.modal.repeat.on',
        defaultMessage: 'Repeat on',
    });

    const repeatEndsLabel = formatMessage({
        id: 'create_post.schedule_post.modal.repeat.ends',
        defaultMessage: 'Repeat ends',
    });

    if (!show) {
        return null;
    }

    return (
        <div className='schedule-post-modal__repeat-actions'>
            <div className='schedule-post-modal__repeat-actions-every'>
                <label>{repeatEveryLabel}</label>
                <div className='schedule-every'>
                    <div>
                        {everyAmountInput}
                        {everyIntervalSelect}
                    </div>
                    {everyInterval === 'month' && everyMonthSelect}
                </div>
            </div>
            {everyInterval === 'week' && (
                <div className='schedule-post-modal__repeat-actions-on'>
                    <label>{repeatOnLabel}</label>
                    {dayPicker}
                </div>
            )}
            <div className='schedule-post-modal__repeat-actions-ends'>
                <label>{repeatEndsLabel}</label>
                {endRadio}
            </div>
        </div>
    );
};

export default RepeatActions;
