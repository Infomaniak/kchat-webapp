// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {Reaction as ReactionType} from '@mattermost/types/reactions';

type Props = {
    canAddReactions: boolean;
    canRemoveReactions: boolean;
    currentUserReacted: boolean;
    emojiName: string;
    emojiIcon: React.ReactNode;
    reactions: ReactionType[];
    users: string[];
};
const MAX_DISPLAY_USER = 20;

const ReactionTooltip: React.FC<Props> = (props: Props) => {
    const {
        canAddReactions,
        canRemoveReactions,
        currentUserReacted,
        emojiIcon,
        emojiName,
        reactions,
        users,
    } = props;

    const reduceUsers = users.slice(0, MAX_DISPLAY_USER);
    const otherUsersCount = reactions.length - reduceUsers.length;

    let names: React.ReactNode;
    if (otherUsersCount > 0) {
        if (reduceUsers.length > 0) {
            names = (
                <FormattedMessage
                    id='reaction.usersAndOthersReacted'
                    defaultMessage='{users} and {otherUsers, number} other {otherUsers, plural, one {user} other {users}}'
                    values={{
                        users: reduceUsers.join(', '),
                        otherUsers: otherUsersCount,
                    }}
                />
            );
        } else {
            names = (
                <FormattedMessage
                    id='reaction.othersReacted'
                    defaultMessage='{otherUsers, number} {otherUsers, plural, one {user} other {users}}'
                    values={{
                        otherUsers: otherUsersCount,
                    }}
                />
            );
        }
    } else if (users.length > 1) {
        names = (
            <FormattedMessage
                id='reaction.usersReacted'
                defaultMessage='{users} and {lastUser}'
                values={{
                    users: reduceUsers.slice(0, -1).join(', '),
                    lastUser: reduceUsers[reduceUsers.length - 1],
                }}
            />
        );
    } else {
        names = users[0];
    }

    let reactionVerb: React.ReactNode;
    if (users.length > 1) {
        if (currentUserReacted) {
            reactionVerb = (
                <FormattedMessage
                    id='reaction.reactionVerb.youAndUsers'
                    defaultMessage='reacted'
                />
            );
        } else {
            reactionVerb = (
                <FormattedMessage
                    id='reaction.reactionVerb.users'
                    defaultMessage='reacted'
                />
            );
        }
    } else if (currentUserReacted) {
        reactionVerb = (
            <FormattedMessage
                id='reaction.reactionVerb.you'
                defaultMessage='reacted'
            />
        );
    } else {
        reactionVerb = (
            <FormattedMessage
                id='reaction.reactionVerb.user'
                defaultMessage='reacted'
            />
        );
    }

    const tooltip = (
        <FormattedMessage
            id='reaction.reacted'
            defaultMessage='{users} {reactionVerb} with {emoji}'
            values={{
                users: <b>{names}</b>,
                reactionVerb,
                emoji: <b>{':' + emojiName + ':'}</b>,
            }}
        />
    );

    let clickTooltip: React.ReactNode;
    if (currentUserReacted && canRemoveReactions) {
        clickTooltip = (
            <FormattedMessage
                id='reaction.clickToRemove'
                defaultMessage='(click to remove)'
            />
        );
    } else if (!currentUserReacted && canAddReactions) {
        clickTooltip = (
            <FormattedMessage
                id='reaction.clickToAdd'
                defaultMessage='(click to add)'
            />
        );
    }

    return (
        <>
            <div className='reaction-emoji--large'>{emojiIcon}</div>
            {tooltip}
            <br/>
            {clickTooltip}
        </>
    );
};

export default ReactionTooltip;
