// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';
import styled from 'styled-components';

import type {Group} from '@mattermost/types/groups';

import {openModal} from 'actions/views/modals';

import GroupIcon from 'components/common/group_icon';
import {UserGroupPopoverController} from 'components/user_group_popover/user_group_popover_controller';

import IkRemoveGroupFromChannelModal from './ik_remove_group_from_channel_modal';

const GroupRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 16px;
    border-radius: 4px;
    height: 48px;
    cursor: pointer;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }
`;

const GroupNameContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    margin-left: 8px;
    overflow: hidden;
`;

const GroupName = styled.span`
    font-size: 14px;
    line-height: 20px;
    color: var(--center-channel-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const GroupHandle = styled.span`
    font-size: 14px;
    line-height: 20px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    margin-left: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const GroupMemberCount = styled.span`
    flex-shrink: 0;
    font-size: 12px;
    line-height: 16px;
    color: var(--center-channel-color);
    background: rgba(var(--center-channel-color-rgb), 0.12);
    border-radius: 4px;
    padding: 4px 10px;
`;

const RemoveLink = styled.button`
    flex-shrink: 0;
    font-size: 12px;
    line-height: 16px;
    color: var(--error-text);
    background: none;
    border: none;
    padding: 0;
    margin-left: 8px;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
        text-decoration: underline;
    }
`;

interface Props {
    group: Group;
    editing?: boolean;
    canRemove?: boolean;
}

export default function GroupItem({group, editing, canRemove}: Props) {
    const returnFocus = useCallback(() => { /* noop */ }, []);
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const handleRemoveClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(openModal({
            modalId: 'remove_group_from_channel',
            dialogType: IkRemoveGroupFromChannelModal,
        }));
    }, [dispatch]);

    const groupContent = (
        <GroupRow
            aria-label={formatMessage({
                id: 'channel_members_rhs.groups.aria_label',
                defaultMessage: 'Team: {groupName}',
            }, {groupName: group.display_name})}
            role='button'
        >
            <GroupIcon/>
            <GroupNameContainer>
                <GroupName>{group.display_name}</GroupName>
                <GroupHandle>{'@'}{group.name}</GroupHandle>
            </GroupNameContainer>
            <GroupMemberCount>
                <FormattedMessage
                    id='channel_members_rhs.groups.member_count'
                    defaultMessage='{count} {count, plural, one {member} other {members}}'
                    values={{count: group.member_count}}
                />
            </GroupMemberCount>
            {editing && canRemove && (
                <RemoveLink
                    onClick={handleRemoveClick}
                    aria-label={formatMessage({id: 'channel_members_rhs.groups.remove', defaultMessage: 'Remove from channel'})}
                >
                    <FormattedMessage
                        id='channel_members_rhs.groups.remove'
                        defaultMessage='Remove from channel'
                    />
                </RemoveLink>
            )}
        </GroupRow>
    );

    return (
        <UserGroupPopoverController
            group={group}
            returnFocus={returnFocus}
        >
            {groupContent}
        </UserGroupPopoverController>
    );
}
