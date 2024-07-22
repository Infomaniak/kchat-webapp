// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';

import type {Post} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {Posts} from 'mattermost-redux/constants';
import type {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {isPostEphemeral} from 'mattermost-redux/utils/post_utils';

import DeletePostModal from 'components/delete_post_modal/delete_post_modal';
import * as Menu from 'components/menu';
import PostMarkdown from 'components/post_markdown';
import PostReminderCustomTimePicker from 'components/post_reminder_custom_time_picker_modal/post_reminder_custom_time_picker_modal';
import ShowMore from 'components/post_view/show_more';
import type {AttachmentTextOverflowType} from 'components/post_view/show_more/show_more';

import {ModalIdentifiers} from 'utils/constants';
import {toUTCUnix} from 'utils/datetime';
import type {TextFormattingOptions} from 'utils/text_formatting';
import {getCurrentMomentForTimezone} from 'utils/timezone';
import * as Utils from 'utils/utils';

import Pluggable from 'plugins/pluggable';

type Props = {
    post: Post; /* The post to render the message for */
    enableFormatting?: boolean; /* Set to enable Markdown formatting */
    options?: TextFormattingOptions; /* Options specific to text formatting */
    compactDisplay?: boolean; /* Set to render post body compactly */
    isRHS?: boolean; /* Flags if the post_message_view is for the RHS (Reply). */
    isRHSOpen?: boolean; /* Whether or not the RHS is visible */
    isRHSExpanded?: boolean; /* Whether or not the RHS is expanded */
    theme: Theme; /* Logged in user's theme */
    pluginPostTypes?: any; /* Post type components from plugins */
    currentRelativeTeamUrl: string;
    overflowType?: AttachmentTextOverflowType;
    maxHeight?: number; /* The max height used by the show more component */
    showPostEditedIndicator?: boolean; /* Whether or not to render the post edited indicator */
    timezone: string; /* Current user timezone */
    isMilitaryTime: boolean; /* Whether or not to use military time */
    userByName?: UserProfile; /* The user object for the post author */
    actions: {
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps: any}) => void;
        addPostReminder: (userId: string, postId: string, remindAt: number) => void;
    };
}

type State = {
    collapse: boolean;
    hasOverflow: boolean;
    checkOverflow: number;
}

const PostReminders = {
    THIRTY_MINUTES: 'thirty_minutes',
    ONE_HOUR: 'one_hour',
    TWO_HOURS: 'two_hours',
    TOMORROW: 'tomorrow',
    MONDAY: 'monday',
    CUSTOM: 'custom',
} as const;

export default class PostMessageView extends React.PureComponent<Props, State> {
    private imageProps: any;

    static defaultProps = {
        options: {},
        isRHS: false,
        pluginPostTypes: {},
        overflowType: undefined,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            collapse: true,
            hasOverflow: false,
            checkOverflow: 0,
        };

        this.imageProps = {
            onImageLoaded: this.handleHeightReceived,
            onImageHeightChanged: this.checkPostOverflow,
        };
    }

    checkPostOverflow = () => {
        // Increment checkOverflow to indicate change in height
        // and recompute textContainer height at ShowMore component
        // and see whether overflow text of show more/less is necessary or not.
        this.setState((prevState) => {
            return {checkOverflow: prevState.checkOverflow + 1};
        });
    };

    handleHeightReceived = (height: number) => {
        if (height > 0) {
            this.checkPostOverflow();
        }
    };

    renderDeletedPost() {
        return (
            <p>
                <FormattedMessage
                    id='post_body.deleted'
                    defaultMessage='(message deleted)'
                />
            </p>
        );
    }

    handleFormattedTextClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        Utils.handleFormattedTextClick(e, this.props.currentRelativeTeamUrl);

    handleDeleteMenuItemActivated = (): void => {
        const deletePostModalData = {
            modalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: this.props.post,
                isRHS: false,
            },
        };

        this.props.actions.openModal(deletePostModalData);
    };

    handlePostReminderMenuClick(id: string) {
        if (id === PostReminders.CUSTOM) {
            const postReminderCustomTimePicker = {
                modalId: ModalIdentifiers.POST_REMINDER_CUSTOM_TIME_PICKER,
                dialogType: PostReminderCustomTimePicker,
                dialogProps: {
                    postId: this.props.post.props.previewed_post,
                },
            };
            this.props.actions.openModal(postReminderCustomTimePicker);
        } else {
            let link = this.props.post.props.previewed_post;

            if (!this.props.post.props.previewed_post) {
                link = this.props.post.props.link;
                if (link.includes('/pl/')) {
                    const parts = link.split('/pl/');
                    const partAfterPl = parts[1];
                    link = partAfterPl;
                }
            }
            const currentDate = getCurrentMomentForTimezone(this.props.timezone);
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

            if (this.props.userByName?.id) {
                this.props.actions.addPostReminder(this.props.userByName?.id, link, toUTCUnix(endTime.toDate()));
            }
        }
    }

    postReminderSubMenuItems = Object.values(PostReminders).map((postReminder) => {
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
            const tomorrow = getCurrentMomentForTimezone(this.props.timezone).add(1, 'day').set({hour: 9, minute: 0}).toDate();

            trailingElements = (
                <span className={`postReminder-${postReminder}_timestamp`}>
                    <FormattedDate
                        value={tomorrow}
                        weekday='short'
                        timeZone={this.props.timezone}
                    />
                    {', '}
                    <FormattedTime
                        value={tomorrow}
                        timeStyle='short'
                        hour12={this.props.isMilitaryTime}
                        timeZone={this.props.timezone}
                    />
                </span>
            );
        }

        if (postReminder === PostReminders.MONDAY) {
            const monday = getCurrentMomentForTimezone(this.props.timezone).add(1, 'week').isoWeekday(1).set({hour: 9, minute: 0}).toDate();

            trailingElements = (
                <span className={`postReminder-${postReminder}_timestamp`}>
                    <FormattedDate
                        value={monday}
                        weekday='short'
                        timeZone={this.props.timezone}
                    />
                    {', '}
                    <FormattedTime
                        value={monday}
                        timeStyle='short'
                        hour12={this.props.isMilitaryTime}
                        timeZone={this.props.timezone}
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

                onClick={() => this.handlePostReminderMenuClick(postReminder)}
            />
        );
    });

    render() {
        const {
            post,
            enableFormatting,
            options,
            pluginPostTypes,
            compactDisplay,
            isRHS,
            theme,
            overflowType,
            maxHeight,
        } = this.props;

        if (post.state === Posts.POST_DELETED) {
            return this.renderDeletedPost();
        }

        if (!enableFormatting) {
            return <span>{post.message}</span>;
        }

        const postType = post.props && post.props.type ? post.props.type : post.type;

        if (pluginPostTypes && pluginPostTypes.hasOwnProperty(postType)) {
            const PluginComponent = pluginPostTypes[postType].component;
            return (
                <PluginComponent
                    post={post}
                    compactDisplay={compactDisplay}
                    isRHS={isRHS}
                    theme={theme}
                />
            );
        }

        let message = post.message;
        const isEphemeral = isPostEphemeral(post);
        if (compactDisplay && isEphemeral) {
            const visibleMessage = Utils.localizeMessage('post_info.message.visible.compact', ' (Only visible to you)');
            message = message.concat(visibleMessage);
        }

        const id = isRHS ? `rhsPostMessageText_${post.id}` : `postMessageText_${post.id}`;
        return (
            <ShowMore
                checkOverflow={this.state.checkOverflow}
                text={message}
                overflowType={overflowType}
                maxHeight={maxHeight}
            >
                <div
                    tabIndex={0}
                    id={id}
                    className='post-message__text'
                    dir='auto'
                    onClick={this.handleFormattedTextClick}
                >
                    {post.type === Posts.POST_TYPES.SYSTEM_POST_REMINDER ? <div>
                        <Menu.Container
                            menuButton={{
                                id: `_button_${this.props.post.id}`,
                                dateTestId: `PostDotMenu-Button-${this.props.post.id}`,
                                class: 'PostPriorityPicker__apply',
                                children:
                        <FormattedMessage
                            id='postpone.post_reminder.menu'
                            defaultMessage='Postpone the reminder'
                        />,
                            }}
                            menu={{
                                id: `dropdown_${this.props.post.id}`,
                                width: '264px',
                            }}
                        >
                            <h5 className='dot-menu__post-reminder-menu-header'>
                                <FormattedMessage
                                    id='post_info.post_reminder.sub_menu.header'
                                    defaultMessage='Set a reminder for:'
                                />
                            </h5>
                            {this.postReminderSubMenuItems}
                        </Menu.Container>
                        <button
                            className='PostPriorityPicker__cancel'
                            onClick={this.handleDeleteMenuItemActivated}
                        >
                            <FormattedMessage
                                id='postpone.post_reminder.mark'
                                defaultMessage='Mark as completed'
                            />
                        </button>
                    </div> : null}
                    <PostMarkdown
                        message={message}
                        imageProps={this.imageProps}
                        options={options}
                        post={post}
                        channelId={post.channel_id}
                        showPostEditedIndicator={this.props.showPostEditedIndicator}
                    />
                </div>
                <Pluggable
                    pluggableName='PostMessageAttachment'
                    postId={post.id}
                    onHeightChange={this.handleHeightReceived}
                />
            </ShowMore>
        );
    }
}
