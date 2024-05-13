// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {Post} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {sendAddToChannelEphemeralPost} from 'actions/global_actions';

import AtMention from 'components/at_mention';

import {Constants} from 'utils/constants';
import {t} from 'utils/i18n';

interface Actions {
    notifyChannelMember: (channelId: string, userIds: string[], postId: string) => void;
    addChannelMember: (channelId: string, userId: string, rootId: string) => void;
    removePost: (post: Post) => void;
}

export interface Props {
    currentUser: UserProfile;
    channelType: string;
    postId: string;
    post: Post;
    userIds: string[];
    usernames: string[];
    noGroupsUsernames: string[];
    actions: Actions;
}

interface State {
    expanded: boolean;
}

export default class PostAddChannelMember extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            expanded: false,
        };
    }

    handleAddChannelMember = () => {
        const {currentUser, post, userIds, usernames} = this.props;

        if (post && post.channel_id) {
            let createAt = post.create_at;
            userIds.forEach((userId, index) => {
                createAt++;
                this.props.actions.addChannelMember(post.channel_id, userId, post.root_id);
                sendAddToChannelEphemeralPost(currentUser, usernames[index], userId, post.channel_id, post.root_id, createAt);
            });

            this.props.actions.removePost(post);
        }
    };

    handleNotifyChannelMember = () => {
        const {post, userIds} = this.props;
        if (post && post.channel_id) {
            this.props.actions.notifyChannelMember(post.channel_id, userIds, this.props.post.props.add_channel_member.original_post_id);
            this.props.actions.removePost(post);
        }
    };

    expand = () => {
        this.setState({expanded: true});
    };

    generateAtMentions(usernames = [] as string[]) {
        if (usernames.length === 1) {
            return (
                <AtMention
                    mentionName={usernames[0]}
                    channelId={this.props.post?.channel_id}
                />
            );
        } else if (usernames.length > 1) {
            function andSeparator(key: number) {
                return (
                    <FormattedMessage
                        key={key}
                        id={'post_body.check_for_out_of_channel_mentions.link.and'}
                        defaultMessage={' and '}
                    />
                );
            }

            function commaSeparator(key: number) {
                return <span key={key}>{', '}</span>;
            }

            if (this.state.expanded || usernames.length <= 3) {
                return (
                    <span>
                        {
                            usernames.map((username) => {
                                return (
                                    <AtMention
                                        key={username}
                                        mentionName={username}
                                        channelId={this.props.post?.channel_id}
                                    />
                                );
                            }).reduce((acc, el, idx, arr) => {
                                if (idx === 0) {
                                    return [el];
                                } else if (idx === arr.length - 1) {
                                    return [...acc, andSeparator(idx), el];
                                }

                                return [...acc, commaSeparator(idx), el];
                            }, [] as JSX.Element[])
                        }
                    </span>
                );
            }
            const otherUsers = [...usernames];
            const firstUserName = otherUsers.shift() as string; // will never be undefined
            const lastUserName = otherUsers.pop() as string; // will never be undefined
            return (
                <span>
                    <AtMention
                        key={firstUserName}
                        mentionName={firstUserName}
                        channelId={this.props.post?.channel_id}
                    />
                    {commaSeparator(1)}
                    <a
                        className='PostBody_otherUsersLink'
                        onClick={this.expand}
                    >
                        <FormattedMessage
                            id={'post_body.check_for_out_of_channel_mentions.others'}
                            defaultMessage={'{numOthers} others'}
                            values={{
                                numOthers: otherUsers.length,
                            }}
                        />
                    </a>
                    {andSeparator(1)}
                    <AtMention
                        key={lastUserName}
                        mentionName={lastUserName}
                        channelId={this.props.post?.channel_id}
                    />
                </span>
            );
        }

        return '';
    }

    render() {
        const {channelType, postId, usernames, noGroupsUsernames} = this.props;
        if (!postId || !channelType) {
            return null;
        }

        let linkId;
        let linkText;
        if (channelType === Constants.PRIVATE_CHANNEL) {
            linkId = t('post_body.check_for_out_of_channel_mentions.link.private');
            linkText = 'add them to this private channel';
        } else if (channelType === Constants.OPEN_CHANNEL) {
            linkId = t('post_body.check_for_out_of_channel_mentions.link.public');
            linkText = 'add them to the channel';
        }

        let outOfChannelMessageID;
        let outOfChannelMessageText;
        let notificationMessageTextId;
        let notificationOrMessageTextId;
        let historyMessageId;

        const outOfChannelAtMentions = this.generateAtMentions(usernames);
        if (usernames.length === 1) {
            outOfChannelMessageID = t('post_body.check_for_out_of_channel_mentions.message.one');
            outOfChannelMessageText = 'did not get notified by this mention because they are not in the channel. Would you like to ';
            notificationOrMessageTextId = 'post_body.check_for_out_of_channel_groups_mentions_choice.message';
            notificationMessageTextId = 'post_body.check_for_out_of_channel_groups_mentions_notify.message';
            historyMessageId = 'post_body.check_for_out_of_channel_mentions.message_last';
        } else if (usernames.length > 1) {
            outOfChannelMessageID = t('post_body.check_for_out_of_channel_mentions.message.multiple');
            outOfChannelMessageText = 'did not get notified by this mention because they are not in the channel. Would you like to ';
            notificationOrMessageTextId = 'post_body.check_for_out_of_channel_groups_mentions_choice.message.multiple';
            notificationMessageTextId = 'post_body.check_for_out_of_channel_groups_mentions_notify.message.multiple';
            historyMessageId = 'post_body.check_for_out_of_channel_mentions.message_last.multiple';
        }

        let outOfGroupsMessageID;
        let outOfGroupsMessageText;
        const outOfGroupsAtMentions = this.generateAtMentions(noGroupsUsernames);
        if (noGroupsUsernames.length) {
            outOfGroupsMessageID = t('post_body.check_for_out_of_channel_groups_mentions.message');
            outOfGroupsMessageText = 'did not get notified by this mention because they are not in the channel. They cannot be added to the channel because they are not a member of the linked groups. To add them to this channel, they must be added to the linked groups.';
        }

        let outOfChannelMessage = null;
        let outOfGroupsMessage = null;

        if (usernames.length) {
            if (channelType === Constants.OPEN_CHANNEL) {
                outOfChannelMessage = (
                    <p>
                        {outOfChannelAtMentions}
                        {' '}
                        <FormattedMessage
                            id={outOfChannelMessageID}
                            defaultMessage={outOfChannelMessageText}
                        />
                        <a
                            className='PostBody_addChannelMemberLink'
                            onClick={this.handleAddChannelMember}
                        >
                            <FormattedMessage
                                id={linkId}
                                defaultMessage={linkText}
                            />
                        </a>
                        <FormattedMessage
                            id={notificationOrMessageTextId}
                            defaultMessage={'or '}
                        />
                        <a
                            className='PostBody_addChannelMemberLink-notify'
                            onClick={this.handleNotifyChannelMember}
                        >
                            <FormattedMessage
                                id={notificationMessageTextId}
                                defaultMessage={'notify them'}
                            />
                        </a>
                        <FormattedMessage
                            id={historyMessageId}
                            defaultMessage={' ? They will have access to all message history.'}
                        />
                    </p>
                );
            } else {
                outOfChannelMessage = (
                    <p>
                        {outOfChannelAtMentions}
                        {' '}
                        <FormattedMessage
                            id={outOfChannelMessageID}
                            defaultMessage={outOfChannelMessageText}
                        />
                        <a
                            className='PostBody_addChannelMemberLink'
                            onClick={this.handleAddChannelMember}
                        >
                            <FormattedMessage
                                id={linkId}
                                defaultMessage={linkText}
                            />
                        </a>
                        <FormattedMessage
                            id={historyMessageId}
                            defaultMessage={' ? They will have access to all message history.'}
                        />
                    </p>
                );
            }
        }

        if (noGroupsUsernames.length) {
            outOfGroupsMessage = (
                <p>
                    {outOfGroupsAtMentions}
                    {' '}
                    <FormattedMessage
                        id={outOfGroupsMessageID}
                        defaultMessage={outOfGroupsMessageText}
                    />
                </p>
            );
        }

        return (
            <>
                {outOfChannelMessage}
                {outOfGroupsMessage}
            </>
        );
    }
}
