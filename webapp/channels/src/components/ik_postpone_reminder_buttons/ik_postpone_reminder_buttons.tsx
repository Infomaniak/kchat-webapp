// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ComponentProps} from 'react';
import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';

import type {Post} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import type {ActionResult} from 'mattermost-redux/types/actions';

import * as Menu from 'components/menu';
import PostReminderCustomTimePicker from 'components/post_reminder_custom_time_picker_modal';

import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnix} from 'utils/datetime';
import {getCurrentMomentForTimezone} from 'utils/timezone';

import type {ModalData} from 'types/actions';

export type Props = {
    post: Post;
    actions: {
        markPostReminderAsDone: (userId: string, postId: string) => Promise<ActionResult<unknown, any>>;
        addPostReminder: (userId: string, postId: string, timestamp: number, reschedule?: boolean, reminderPostId?: string) => void;
        openModal: (modalData: ModalData<ComponentProps<typeof PostReminderCustomTimePicker>>) => void;
    };
    timezone?: string; /* Current user timezone */
    isMilitaryTime?: boolean; /* Whether or not to use military time */
    userByName?: UserProfile; /* The user object for the post author */
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
        if (props.userByName) {
            props.actions.markPostReminderAsDone(props.userByName.id, props.post.id);
        }
    };

    const handlePostReminderMenuClick = (id: string) => {
        if (id === PostReminders.CUSTOM) {
            const postReminderCustomTimePicker = {
                modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
                dialogType: PostReminderCustomTimePicker,
                dialogProps: {
                    postId: props.post.props.previewed_post,
                },
            };
            props.actions.openModal(postReminderCustomTimePicker);
        } else {
            const currentDate = getCurrentMomentForTimezone(props.timezone);
            let endTime = currentDate;
            if (id === PostReminders.THIRTY_MINUTES) {
                // add 30 minutes in current time
                endTime = currentDate.add(0.1, 'minutes');
            } else if (id === PostReminders.ONE_HOUR) {
                // add 1 hour in current time
                endTime = currentDate.add(1, 'hour');
            } else if (id === PostReminders.TWO_HOURS) {
                // add 2 hours in current time
                endTime = currentDate.add(2, 'hours');
            } else if (id === PostReminders.TOMORROW) {
                // set to next day 9 in the morning
                endTime = currentDate.add(1, 'day').set({hour: 9, minute: 0});
            } else if (id === PostReminders.MONDAY) {
                // set to next Monday 9 in the morning
                endTime = currentDate.add(1, 'week').isoWeekday(1).set({hour: 9, minute: 0});
            }

            if (props.userByName?.id) {
                props.actions.addPostReminder(props.userByName?.id, props.post.props.post_id, toUTCUnix(endTime.toDate()), true, props.post.id);
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
            const tomorrow = getCurrentMomentForTimezone(props.timezone).add(1, 'day').set({hour: 9, minute: 0}).toDate();

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
            const monday = getCurrentMomentForTimezone(props.timezone).add(1, 'week').isoWeekday(1).set({hour: 9, minute: 0}).toDate();

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
        <div style={{paddingTop: '10px', paddingBottom: '10px'}}>
            <Menu.Container
                menuButton={{
                    id: `_button_${props.post.id}`,
                    dateTestId: `PostDotMenu-Button-${props.post.id}`,
                    class: 'PostPriorityPicker__apply',
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
                className='PostPriorityPicker__cancel'
                onClick={handleDeleteMenuItemActivated}
                style={{marginLeft: '10px'}}
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
