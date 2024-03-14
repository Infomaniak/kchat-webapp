// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {FC} from 'react';
import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useHistory} from 'react-router-dom';

import type {ServerError} from '@mattermost/types/errors';
import type {UserProfile} from '@mattermost/types/users';

import SimpleTooltip from 'components/widgets/simple_tooltip';
import Avatar from 'components/widgets/users/avatar';

import * as Utils from 'utils/utils';

import {DMButton, DMContainer, Gap, UserButton, UserList, UserListItem, Username, getListHeight, ProfileTag} from './styled';

export const VIEWPORT_SCALE_FACTOR = 0.4;

export const MAX_LIST_HEIGHT = 500;

export type GroupMember = {
    user: UserProfile;
    displayName: string;
}

export type Props = {
    members: GroupMember[];
    teamUrl?: string;
    membersCount: number;

    hide: () => void;
    showUserOverlay: (user: UserProfile) => void;

    actions: {
        openDirectChannelToUserId: (userId?: string) => Promise<{ error: ServerError }>;
        closeRightHandSide: () => void;
    };
}

const UserListProfiles: FC<Props> = ({
    actions,
    members,
    teamUrl,
    membersCount,
    hide,
    showUserOverlay,
}) => {
    const history = useHistory();

    const {formatMessage} = useIntl();

    const [currentDMLoading, setCurrentDMLoading] = useState<string | undefined>(undefined);

    const showDirectChannel = (user: UserProfile) => {
        if (currentDMLoading !== undefined) {
            return;
        }
        setCurrentDMLoading(user.id);
        actions.openDirectChannelToUserId(user.id).then((result: { error: ServerError }) => {
            if (!result.error) {
                actions.closeRightHandSide();
                setCurrentDMLoading(undefined);
                hide?.();

                history.push(`${teamUrl}/messages/@${user.username}`);
            }
        });
    };

    const Item = ({index}: { index: number }) => {
        const user = members[index].user;
        const name = members[index].displayName;

        return (
            <UserListItem
                className='group-member-list_item'
                first={index === 0}
                key={user.id}
                role='listitem'
                last={index === membersCount - 1}
            >
                <UserButton
                    onClick={() => showUserOverlay(user)}
                    aria-haspopup='dialog'
                >
                    <Avatar
                        username={user.username}
                        size={'sm'}
                        url={Utils.imageURLForUser(user?.id ?? '')}
                        className={'avatar-post-preview'}
                        tabIndex={-1}
                    />
                    <Username className='overflow--ellipsis text-nowrap'>{name}</Username>
                    <ProfileTag
                        className='user-tag'
                        text={formatMessage({id: 'tag.default.guest', defaultMessage: 'External'})}
                    />
                    <Gap className='group-member-list_gap'/>
                </UserButton>
                <DMContainer className='group-member-list_dm-button'>
                    <SimpleTooltip
                        id={`name-${user.id}`}
                        content={formatMessage({id: 'group_member_list.sendMessageTooltip', defaultMessage: 'Send message'})}
                    >
                        <DMButton
                            className='btn btn-icon btn-xs'
                            aria-label={formatMessage(
                                {id: 'group_member_list.sendMessageButton', defaultMessage: 'Send message to {user}'},
                                {user: name})}
                            onClick={() => showDirectChannel(user)}
                        >
                            <i
                                className='icon icon-send'
                            />
                        </DMButton>
                    </SimpleTooltip>
                </DMContainer>
            </UserListItem>
        );
    };

    const renderContent = () => {
        return members.map((member, idx) => (
            <Item
                key={member.user.id}
                index={idx}
            />
        ));
    };

    return (
        <UserList
            style={{height: Math.min(MAX_LIST_HEIGHT, getListHeight(membersCount))}}
            role='list'
        >
            {renderContent()}
        </UserList>
    );
};

export default React.memo(UserListProfiles);
