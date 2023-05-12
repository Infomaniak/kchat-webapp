// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import {Moment} from 'moment-timezone';
import ReactSelect, {ValueType} from 'react-select';

type Props = {
    show: boolean;
    timestamp: Moment;
};

type EveryIntervalOption = {
    name: 'day' | 'week' | 'month';
    label: {
        id: string;
        defaultMessage: string;
    };
};

const dayOptions = [
    {name: 'monday', label: {id: 'create_post.schedule_post.modal.repeat.on.monday', defaultMessage: 'M'}},
    {name: 'tuesday', label: {id: 'create_post.schedule_post.modal.repeat.on.tuesday', defaultMessage: 'T'}},
    {name: 'wednesday', label: {id: 'create_post.schedule_post.modal.repeat.on.wednesday', defaultMessage: 'W'}},
    {name: 'thursday', label: {id: 'create_post.schedule_post.modal.repeat.on.thursday', defaultMessage: 'T'}},
    {name: 'friday', label: {id: 'create_post.schedule_post.modal.repeat.on.friday', defaultMessage: 'F'}},
    {name: 'saturday', label: {id: 'create_post.schedule_post.modal.repeat.on.saturday', defaultMessage: 'S'}},
    {name: 'sunday', label: {id: 'create_post.schedule_post.modal.repeat.on.sunday', defaultMessage: 'S'}},
];

const everyIntervalOptions: EveryIntervalOption[] = [
    {name: 'day', label: {id: 'create_post.schedule_post.modal.repeat.every.day', defaultMessage: 'Day'}},
    {name: 'week', label: {id: 'create_post.schedule_post.modal.repeat.every.week', defaultMessage: 'Week'}},
    {name: 'month', label: {id: 'create_post.schedule_post.modal.repeat.every.month', defaultMessage: 'Month'}},
];

const RepeatActions = ({show, timestamp}: Props) => {
    const {formatMessage} = useIntl();
    const [everyInterval, setEveryInterval] = useState<EveryIntervalOption['name']>('week');

    const dayPicker = dayOptions.map((option) => (
        <button
            className={classNames('btn', {
                'btn-primary': false,
                'btn-secondary': true,
            })}
            key={'schedule-post-repeat-day-' + option.name}
        >
            {formatMessage(option.label)}
        </button>
    ));

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

    const selectEveryInterval = (
        <ReactSelect
            className='react-select'
            isClearable={false}
            isSearchable={false}
            onChange={handleEveryIntervalChange}
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
