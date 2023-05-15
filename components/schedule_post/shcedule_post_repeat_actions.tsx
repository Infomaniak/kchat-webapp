// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import moment, {Moment} from 'moment-timezone';
import ReactSelect, {ValueType} from 'react-select';

type Props = {
    show: boolean;
    timestamp: Moment;
    timezone?: string;
};

type EveryIntervalOption = {
    name: 'day' | 'week' | 'month';
    label: {
        id: string;
        defaultMessage: string;
    };
};

const everyIntervalOptions: EveryIntervalOption[] = [
    {name: 'day', label: {id: 'create_post.schedule_post.modal.repeat.every.day', defaultMessage: 'Day'}},
    {name: 'week', label: {id: 'create_post.schedule_post.modal.repeat.every.week', defaultMessage: 'Week'}},
    {name: 'month', label: {id: 'create_post.schedule_post.modal.repeat.every.month', defaultMessage: 'Month'}},
];

const momentInstance = moment();

const RepeatActions = ({show, timestamp, timezone}: Props) => {
    const {formatMessage, formatDate} = useIntl();
    const [everyInterval, setEveryInterval] = useState<EveryIntervalOption['name']>('week');
    const [daySelected, setDaySelected] = useState<Record<number, boolean>>({});

    const handleDaySelection = (day: number) => setDaySelected({
        ...daySelected,
        [day]: !daySelected[day] ?? true,
    });

    const dayPicker = [];
    for (let i = 1; i <= 7; i++) {
        const dayInitial = formatDate(momentInstance.weekday(i).toDate(), {
            weekday: 'narrow',
            timeZone: timezone,
        })[0];
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

    // const selectEveryAmount = (
    //     <ReactSelect
    //         options={}
    //     />
    // );

    const handleEveryIntervalChange = (option: ValueType<EveryIntervalOption>) => {
        if (!option || !('name' in option)) {
            return;
        }
        setEveryInterval(option.name);
    };

    const formatEveryIntervalOptionLabel = (option: EveryIntervalOption) => formatMessage(option.label);

    const isEveryIntervalOptionSelected = (option: EveryIntervalOption) => option.name === everyInterval;

    const selectEveryInterval = (
        <ReactSelect
            className='react-select'
            classNamePrefix='react-select'
            isClearable={false}
            isSearchable={false}
            onChange={handleEveryIntervalChange}
            isOptionSelected={isEveryIntervalOptionSelected}
            formatOptionLabel={formatEveryIntervalOptionLabel}
            value={everyIntervalOptions.find((option) => option.name === everyInterval)}
            options={everyIntervalOptions}
        />
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
                {/* {selectEveryAmount} */}
                {selectEveryInterval}
            </div>
            <div className='schedule-post-modal__repeat-actions-on'>
                <label>{repeatOnLabel}</label>
                {dayPicker}
            </div>
            <div className='schedule-post-modal__repeat-actions-ends'>
                <label>{repeatEndsLabel}</label>
            </div>
        </div>
    );
};

export default RepeatActions;
