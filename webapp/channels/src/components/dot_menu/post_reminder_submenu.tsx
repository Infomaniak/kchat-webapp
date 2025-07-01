// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage, FormattedDate, FormattedTime, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {ChevronRightIcon, ClockOutlineIcon} from '@mattermost/compass-icons/components';
import type {Post} from '@mattermost/types/posts';

import {addPostReminder} from 'mattermost-redux/actions/posts';
import {isQuotaExceeded} from 'mattermost-redux/utils/plans_util';

import {openModal} from 'actions/views/modals';

import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import {useNextPlan} from 'components/common/hooks/useNextPlan';
import * as Menu from 'components/menu';
import PostReminderCustomTimePicker from 'components/post_reminder_custom_time_picker_modal';

import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnixInSeconds} from 'utils/datetime';
import {getCurrentMomentForTimezone} from 'utils/timezone';

type Props = {
    userId: string;
    post: Post;
    isMilitaryTime: boolean;
    timezone?: string;
}

const PostReminders = {
    THIRTY_MINUTES: 'thirty_minutes',
    ONE_HOUR: 'one_hour',
    TWO_HOURS: 'two_hours',
    TOMORROW: 'tomorrow',
    MONDAY: 'monday',
    CUSTOM: 'custom',
} as const;

function PostReminderSubmenu(props: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const {reminder_custom_date: reminderCustomDate} = useGetUsageDeltas();
    const nextPlan = useNextPlan();

    function handlePostReminderMenuClick(id: string) {
        if (id === PostReminders.CUSTOM) {
            const postReminderCustomTimePicker = {
                modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
                dialogType: PostReminderCustomTimePicker,
                dialogProps: {
                    postId: props.post.id,
                },
            };

            dispatch(openModal(postReminderCustomTimePicker));
        } else {
            const currentDate = getCurrentMomentForTimezone(props.timezone);

            let endTime = currentDate;
            if (id === PostReminders.THIRTY_MINUTES) {
                // add 30 minutes in current time
                endTime = currentDate.add(30, 'minutes');
            } else if (id === PostReminders.ONE_HOUR) {
                // add 1 hour in current time
                endTime = currentDate.add(1, 'hour');
            } else if (id === PostReminders.TWO_HOURS) {
                // add 2 hours in current time
                endTime = currentDate.add(2, 'hours');
            } else if (id === PostReminders.TOMORROW) {
                // set to next day 8 in the morning
                endTime = currentDate.add(1, 'day').set({hour: 8, minute: 0});
            } else if (id === PostReminders.MONDAY) {
                // set to next Monday 8 in the morning
                endTime = currentDate.add(1, 'week').isoWeekday(1).set({hour: 8, minute: 0});
            }

            dispatch(addPostReminder(props.userId, props.post.id, toUTCUnixInSeconds(endTime.toDate())));
        }
    }

    const postReminderSubMenuItems = Object.values(PostReminders).map((postReminder) => {
        let labels = null;
        let clickHandler = () => handlePostReminderMenuClick(postReminder);
        let isQuotaReached = false;
        if (postReminder === PostReminders.THIRTY_MINUTES) {
            labels = (
                <FormattedMessage
                    id='post_info.post_reminder.sub_menu.thirty_minutes'
                    defaultMessage='30 mins'
                />
            );
        } else if (postReminder === PostReminders.ONE_HOUR) {
            labels = (
                <FormattedMessage
                    id='post_info.post_reminder.sub_menu.one_hour'
                    defaultMessage='1 hour'
                />
            );
        } else if (postReminder === PostReminders.TWO_HOURS) {
            labels = (
                <FormattedMessage
                    id='post_info.post_reminder.sub_menu.two_hours'
                    defaultMessage='2 hours'
                />
            );
        } else if (postReminder === PostReminders.TOMORROW) {
            labels = (
                <FormattedMessage
                    id='post_info.post_reminder.sub_menu.tomorrow'
                    defaultMessage='Tomorrow'
                />
            );
        } else if (postReminder === PostReminders.MONDAY) {
            labels = (
                <FormattedMessage
                    id='post_info.post_reminder.sub_menu.monday'
                    defaultMessage='Monday'
                />
            );
        } else {
            const enabled = (
                <FormattedMessage
                    id='post_info.post_reminder.sub_menu.custom'
                    defaultMessage='Custom'
                />
            );
            const disabled = (
                <wc-ksuite-pro-upgrade-dialog offer={nextPlan}>
                    <div
                        slot='trigger-element'
                        style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                        {enabled}
                        <wc-ksuite-pro-upgrade-tag/>
                    </div>
                </wc-ksuite-pro-upgrade-dialog>
            );
            const {component, onClick} = isQuotaExceeded(reminderCustomDate, enabled, disabled, clickHandler);
            isQuotaReached = reminderCustomDate >= 0;
            labels = component;
            clickHandler = onClick;
        }

        let trailingElements = null;
        if (postReminder === PostReminders.TOMORROW) {
            const tomorrow = getCurrentMomentForTimezone(props.timezone).add(1, 'day').set({hour: 8, minute: 0}).toDate();

            trailingElements = (
                <span className={`postReminder-${postReminder}_timestamp`}>
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

        if (postReminder === PostReminders.MONDAY) {
            const monday = getCurrentMomentForTimezone(props.timezone).add(1, 'week').isoWeekday(1).set({hour: 8, minute: 0}).toDate();

            trailingElements = (
                <span className={`postReminder-${postReminder}_timestamp`}>
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
                id={`remind_post_options_${postReminder}`}
                key={`remind_post_options_${postReminder}`}
                labels={labels}
                trailingElements={trailingElements}
                onClick={clickHandler}
                aria-haspopup={isQuotaReached}
                aria-expanded={isQuotaReached}
            />
        );
    });

    return (
        <Menu.SubMenu
            id={`remind_post_${props.post.id}`}
            menuAriaLabel={formatMessage({
                id: 'post_info.post_reminder.sub_menu.header',
                defaultMessage: 'Set a reminder for:',
            })}
            labels={
                <FormattedMessage
                    id='post_info.post_reminder.menu'
                    defaultMessage='Remind'
                />
            }
            leadingElement={<ClockOutlineIcon size={18}/>}
            trailingElements={<span className={'dot-menu__item-trailing-icon'}><ChevronRightIcon size={16}/></span>}
            menuId={`remind_post_${props.post.id}-menu`}
            subMenuHeader={
                <h5
                    className={'dot-menu__post-reminder-menu-header'}
                >
                    {formatMessage(
                        {
                            id: 'post_info.post_reminder.sub_menu.header',
                            defaultMessage: 'Set a reminder for:',
                        },
                    )}
                </h5>}
        >
            {postReminderSubMenuItems}
        </Menu.SubMenu>
    );
}

export default memo(PostReminderSubmenu);
