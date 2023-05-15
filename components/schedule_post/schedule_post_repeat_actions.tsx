// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import moment, {Moment} from 'moment-timezone';
import ReactSelect, {ValueType} from 'react-select';

import {getRoundedTime} from 'components/custom_status/date_time_input';

type Props = {
    show: boolean;
    timestamp: Moment;
    timezone?: string;
};

type EveryIntervalOption = {
    value: 'day' | 'week' | 'month';
    label: {
        id: string;
        defaultMessage: string;
    };
};

type EndRadioOption = 'never' | 'on';

const everyIntervalOptions: EveryIntervalOption[] = [
    {value: 'day', label: {id: 'create_post.schedule_post.modal.repeat.every.day', defaultMessage: 'Day'}},
    {value: 'week', label: {id: 'create_post.schedule_post.modal.repeat.every.week', defaultMessage: 'Week'}},
    {value: 'month', label: {id: 'create_post.schedule_post.modal.repeat.every.month', defaultMessage: 'Month'}},
];

const momentInstance = moment();

const RepeatActions = ({show, timestamp, timezone}: Props) => {
    const {formatMessage, formatDate} = useIntl();
    const [everyInterval, setEveryInterval] = useState<EveryIntervalOption['value']>('week');
    const [daySelected, setDaySelected] = useState<Record<number, boolean>>({});
    const [endRadioSelected, setEndRadioSelected] = useState<EndRadioOption>('never');
    const [endMoment, setEndMoment] = useState<Moment>(getRoundedTime(timestamp));

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
            className='schedule-every-select'
            classNamePrefix='react-select'
            isClearable={false}
            isSearchable={false}
            onChange={handleEveryIntervalChange}
            formatOptionLabel={formatEveryIntervalOptionLabel}
            value={everyIntervalOptions.find((option) => option.value === everyInterval)}
            options={everyIntervalOptions}
        />
    );

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
                {/* {everyAmountInput} */}
                {everyIntervalSelect}
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
