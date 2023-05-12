// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import {Moment} from 'moment-timezone';

type Props = {
    show: boolean;
    timestamp: Moment;
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

const RepeatActions = ({show, timestamp}: Props) => {
    const {formatMessage} = useIntl();

    const renderedDayOptions = dayOptions.map((option, index) => (
        <button
            className={classNames('btn', {
                'btn-primary': timestamp.weekday() === index + 1,
                'btn-secondary': timestamp.weekday() !== index + 1,
            })}
            key={'schedule-post-repeat-day-' + option.name}
        >
            {formatMessage(option.label)}
        </button>
    ));

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
            </div>
            <div className='schedule-post-modal__repeat-actions-on'>
                <label>{repeatOnLabel}</label>
                {renderedDayOptions}
            </div>
            <div className='schedule-post-modal__repeat-actions-ends'>
                <label>{repeatEndsLabel}</label>
            </div>
        </div>
    );
};

export default RepeatActions;
