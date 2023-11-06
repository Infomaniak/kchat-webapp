// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChevronRightIcon, ClockOutlineIcon} from '@infomaniak/compass-icons/components';
import React from 'react';
import {FormattedMessage, FormattedDate, FormattedTime, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import type {Post} from '@mattermost/types/posts';

import {addPostReminder} from 'mattermost-redux/actions/posts';

import {openModal} from 'actions/views/modals';

import * as Menu from 'components/menu';
import PostReminderCustomTimePicker from 'components/post_reminder_custom_time_picker_modal';

import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnix} from 'utils/datetime';
import {t} from 'utils/i18n';
import {getCurrentMomentForTimezone} from 'utils/timezone';

type Props = {
    userId: string;
    post: Post;
    isMilitaryTime: boolean;
    timezone?: string;
    parentMenuId: string;
}

const postReminderTimes = [
    {id: 'thirty_minutes', label: t('post_info.post_reminder.sub_menu.thirty_minutes'), labelDefault: '30 mins'},
    {id: 'one_hour', label: t('post_info.post_reminder.sub_menu.one_hour'), labelDefault: '1 hour'},
    {id: 'two_hours', label: t('post_info.post_reminder.sub_menu.two_hours'), labelDefault: '2 hours'},
    {id: 'tomorrow', label: t('post_info.post_reminder.sub_menu.tomorrow'), labelDefault: 'Tomorrow'},
    {id: 'monday', label: t('post_info.post_reminder.sub_menu.monday'), labelDefault: 'Monday'},
    {id: 'custom', label: t('post_info.post_reminder.sub_menu.custom'), labelDefault: 'Custom'},
];

export function PostReminderSubmenu(props: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const setPostReminder = (id: string): void => {
        const currentDate = getCurrentMomentForTimezone(props.timezone);
        let endTime = currentDate;
        switch (id) {
        case 'thirty_minutes':
            // add 30 minutes in current time
            endTime = currentDate.add(30, 'minutes');
            break;
        case 'one_hour':
            // add 1 hour in current time
            endTime = currentDate.add(1, 'hour');
            break;
        case 'two_hours':
            // add 2 hours in current time
            endTime = currentDate.add(2, 'hours');
            break;
        case 'tomorrow':
            // tomorrow 9:00
            endTime = currentDate.add(1, 'day').hours(9).minutes(0).seconds(0);
            break;
        case 'monday':
            // monday 9:00
            currentDate.add(1, 'weeks');
            endTime = currentDate.day(1).hour(9).minute(0).second(0);
            break;
        }

        dispatch(addPostReminder(props.userId, props.post.id, toUTCUnix(endTime.toDate())));
    };

    const setCustomPostReminder = (): void => {
        const postReminderCustomTimePicker = {
            modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
            dialogType: PostReminderCustomTimePicker,
            dialogProps: {
                postId: props.post.id,
            },
        };
        dispatch(openModal(postReminderCustomTimePicker));
    };

    const postReminderSubMenuItems =
        postReminderTimes.map(({id, label, labelDefault}) => {
            const labels = (
                <FormattedMessage
                    id={label}
                    defaultMessage={labelDefault}
                />
            );

            let trailing: React.ReactNode;
            if (id === 'tomorrow') {
                const tomorrow = getCurrentMomentForTimezone(props.timezone).add(1, 'day').hours(9).minutes(0).seconds(0).toDate();

                trailing = (
                    <span className={`postReminder-${id}_timestamp`}>
                        <FormattedDate
                            value={tomorrow}
                            weekday='short'
                            timeZone={props.timezone}
                        />
                        {', '}
                        <FormattedTime
                            value={tomorrow}
                            timeStyle='short'
                            hour12={!props.isMilitaryTime}
                            timeZone={props.timezone}
                        />
                    </span>
                );
            }
            if (id === 'monday') {
                const monday = getCurrentMomentForTimezone(props.timezone).day(1).hour(9).minute(0).second(0).toDate();

                trailing = (
                    <span className={`postReminder-${id}_timestamp`}>
                        <FormattedDate
                            value={monday}
                            weekday='short'
                            timeZone={props.timezone}
                        />
                        {', '}
                        <FormattedTime
                            value={monday}
                            timeStyle='short'
                            hour12={!props.isMilitaryTime}
                            timeZone={props.timezone}
                        />
                    </span>
                );
            }
            return (
                <Menu.Item
                    key={`remind_post_options_${id}`}
                    id={`remind_post_options_${id}`}
                    labels={labels}
                    trailingElements={trailing}
                    onClick={id === 'custom' ? () => setCustomPostReminder() : () => setPostReminder(id)}
                />
            );
        });

    return (
        <Menu.SubMenu
            id={`remind_post_${props.post.id}`}
            labels={
                <FormattedMessage
                    id='post_info.post_reminder.menu'
                    defaultMessage='Remind'
                />
            }
            leadingElement={<ClockOutlineIcon size={18}/>}
            trailingElements={<span className={'dot-menu__item-trailing-icon'}><ChevronRightIcon size={16}/></span>}
            menuId={`remind_post_${props.post.id}-menu`}
            parentMenuId={props.parentMenuId}
        >
            <h5 className={'dot-menu__post-reminder-menu-header'}>
                {formatMessage(
                    {id: 'post_info.post_reminder.sub_menu.header',
                        defaultMessage: 'Set a reminder for:'},
                )}
            </h5>
            {postReminderSubMenuItems}
        </Menu.SubMenu>
    );
}
