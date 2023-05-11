// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage, FormattedDate, FormattedTime, useIntl} from 'react-intl';

import {addPostReminder} from 'mattermost-redux/actions/posts';
import {openModal} from 'actions/views/modals';

import Menu from 'components/widgets/menu/menu';
import PostReminderCustomTimePicker from 'components/post_reminder_custom_time_picker_modal';

import * as Utils from 'utils/utils';
import {getCurrentMomentForTimezone} from 'utils/timezone';
import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnix} from 'utils/datetime';
import {t} from 'utils/i18n';

import {Post} from '@mattermost/types/posts';

type Props = {
    userId: string;
    post: Post;
    isMilitaryTime: boolean;
    show: boolean;
    timezone?: string;
}

const postReminderTimes = [
    {id: 'thirty_minutes', label: t('post_info.post_reminder.sub_menu.thirty_minutes'), labelDefault: '30 mins'},
    {id: 'one_hour', label: t('post_info.post_reminder.sub_menu.one_hour'), labelDefault: '1 hour'},
    {id: 'two_hours', label: t('post_info.post_reminder.sub_menu.two_hours'), labelDefault: '2 hours'},
    {id: 'tomorrow', label: t('post_info.post_reminder.sub_menu.tomorrow'), labelDefault: 'Tomorrow'},
    {id: 'custom', label: t('post_info.post_reminder.sub_menu.custom'), labelDefault: 'Custom'},
];

export function PostReminderSubmenu({userId, post, isMilitaryTime, show, timezone}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const setPostReminder = (id: string): void => {
        const currentDate = getCurrentMomentForTimezone(timezone);
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
        }

        dispatch(addPostReminder(userId, post.id, toUTCUnix(endTime.toDate())));
    };

    const setCustomPostReminder = (): void => {
        const postReminderCustomTimePicker = {
            modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
            dialogType: PostReminderCustomTimePicker,
            dialogProps: {
                postId: post.id,
            },
        };
        dispatch(openModal(postReminderCustomTimePicker));
    };

    const postReminderSubMenuItems =
        postReminderTimes.map(({id, label, labelDefault}) => {
            let labels: string | JSX.Element = formatMessage({id: label, defaultMessage: labelDefault});

            if (id === 'tomorrow') {
                const tomorrow = getCurrentMomentForTimezone(timezone).add(1, 'day').hours(9).minutes(0).seconds(0).toDate();

                labels = (
                    <span>
                        {labels}
                        <span className='MenuItem__opacity remind_menu__right_decorator'>
                            <FormattedDate
                                value={tomorrow}
                                weekday='short'
                            />
                            {', '}
                            <FormattedTime
                                value={tomorrow}
                                timeStyle='short'
                                hour12={!isMilitaryTime}
                            />
                        </span>
                    </span>
                );
            }

            return {
                id: `remind_post_options_${id}`,
                text: labels,
                action: id === 'custom' ? () => setCustomPostReminder() : () => setPostReminder(id),
            };
        });

    if (!show) {
        return null;
    }

    return (
        <Menu.ItemSubMenu
            id={`remind_post_${post.id}`}
            direction='left'
            subMenu={postReminderSubMenuItems}
            icon={Utils.getMenuItemIcon('icon-bell-outline')}
            text={(
                <FormattedMessage
                    id='post_info.post_reminder.menu'
                    defaultMessage='Remind'
                />
            )}
        />
    );
}
