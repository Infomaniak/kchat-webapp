// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ComponentProps} from 'react';
import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';

import type {Post} from '@mattermost/types/posts';

import type {ReminderTimestamp} from 'mattermost-redux/actions/posts';
import type {ActionResult} from 'mattermost-redux/types/actions';

import * as Menu from 'components/menu';
import PostReminderCustomTimePicker from 'components/post_reminder_custom_time_picker_modal';

import {ModalIdentifiers} from 'utils/constants';
import {getCurrentMomentForTimezone} from 'utils/timezone';

import type {ModalData} from 'types/actions';

export type Props = {
    post: Post;
    actions: {
        markPostReminderAsDone: (userId: string, postId: string) => Promise<ActionResult<unknown, any>>;
        addPostReminder: (userId: string, postId: string, timestamp: ReminderTimestamp, reschedule?: boolean, reminderPostId?: string) => void;
        openModal: (modalData: ModalData<ComponentProps<typeof PostReminderCustomTimePicker>>) => void;
    };
    timezone?: string; /* Current user timezone */
    isMilitaryTime?: boolean; /* Whether or not to use military time */
    currentUserId: string;
};

const PostReminders = {
    THIRTY_MINUTES: 'thirty_minutes',
    ONE_HOUR: 'one_hour',
    TWO_HOURS: 'two_hours',
    TOMORROW: 'tomorrow',
    MONDAY: 'monday',
    CUSTOM: 'custom',
} as const;

const IkPostponeReminderButtons = (props: Props) => {
    const handleDeleteMenuItemActivated = (): void => {
        const postId = props.post.id;

        if (props.currentUserId) {
            const userId = props.currentUserId;
            props.actions.markPostReminderAsDone(userId, postId);
        }
    };

    const handlePostReminderMenuClick = (id: string) => {
        if (id === PostReminders.CUSTOM) {
            const postReminderCustomTimePicker = {
                modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
                dialogType: PostReminderCustomTimePicker,
                dialogProps: {
                    postId: props.post.props.post_id,
                    reminderPostId: props.post.id,
                    postpone: true,
                },
            };
            props.actions.openModal(postReminderCustomTimePicker);
        } else {
            let targetTime: ReminderTimestamp | null = null;
            if (id === PostReminders.THIRTY_MINUTES) {
                targetTime = {type: 'fixed', value: '30 minutes'};
            } else if (id === PostReminders.ONE_HOUR) {
                targetTime = {type: 'fixed', value: '1 hour'};
            } else if (id === PostReminders.TWO_HOURS) {
                targetTime = {type: 'fixed', value: '2 hours'};
            } else if (id === PostReminders.TOMORROW) {
                targetTime = {type: 'fixed', value: 'tomorrow'};
            } else {
                targetTime = {type: 'fixed', value: 'monday'};
            }

            const postId = props.post.props.post_id;
            const reschedule = true;
            const reminderPostId = props.post.id;

            if (props.currentUserId) {
                const userId = props.currentUserId;
                props.actions.addPostReminder(userId, postId, targetTime, reschedule, reminderPostId);
            }
        }
    };

    const postReminderSubMenuItems = Object.values(PostReminders).map((postReminder) => {
        let labels = null;
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
            labels = (
                <FormattedMessage
                    id='post_info.post_reminder.sub_menu.custom'
                    defaultMessage='Custom'
                />
            );
        }

        let trailingElements = null;
        if (postReminder === PostReminders.TOMORROW) {
            const tomorrow = getCurrentMomentForTimezone(props.timezone).
                add(1, 'day').
                set({hour: 8, minute: 0}).
                toDate();

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
                        hour12={props.isMilitaryTime}
                        timeZone={props.timezone}
                    />
                </span>
            );
        }

        if (postReminder === PostReminders.MONDAY) {
            const monday = getCurrentMomentForTimezone(props.timezone).
                add(1, 'week').
                isoWeekday(1).
                set({hour: 8, minute: 0}).
                toDate();

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
                        hour12={props.isMilitaryTime}
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

                onClick={() => handlePostReminderMenuClick(postReminder)}
            />
        );
    });

    return (
        <div className='system-bot-message__buttons'>
            <Menu.Container
                menuButton={{
                    id: `_button_${props.post.id}`,
                    dateTestId: `PostDotMenu-Button-${props.post.id}`,
                    class: 'btn btn-sm btn-primary',
                    children:
    <FormattedMessage
        id='postpone.post_reminder.menu'
        defaultMessage='Postpone the reminder'
    />,
                }}
                menu={{
                    id: `dropdown_${props.post.id}`,
                    width: '264px',
                }}
            >
                <h5 className='dot-menu__post-reminder-menu-header'>
                    <FormattedMessage
                        id='post_info.post_reminder.sub_menu.header'
                        defaultMessage='Set a reminder for:'
                    />
                </h5>
                {postReminderSubMenuItems}
            </Menu.Container>
            <button
                className='btn btn-sm btn-tertiary'
                onClick={handleDeleteMenuItemActivated}
            >
                <FormattedMessage
                    id='postpone.post_reminder.mark'
                    defaultMessage='Mark as completed'
                />
            </button>
        </div>
    );
};

export default IkPostponeReminderButtons;
