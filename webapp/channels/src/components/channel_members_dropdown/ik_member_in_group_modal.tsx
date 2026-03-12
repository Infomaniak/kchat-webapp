import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {GenericModal} from '@mattermost/components';
import type {Channel} from '@mattermost/types/channels';
import type {Group} from '@mattermost/types/groups';

import {getCurrentTeamAccountId} from 'mattermost-redux/selectors/entities/teams';

import GroupIcon from 'components/common/group_icon';

import {getManagerTeamsUrl} from 'utils/utils';

type Props = {
    channel: Channel;
    groups: Group[];
    isSystemAdmin: boolean;
    onExited: () => void;
}

const IkMemberInGroupModal = ({channel, groups, isSystemAdmin, onExited}: Props) => {
    const currentTeamAccountId = useSelector(getCurrentTeamAccountId);

    const handleManage = () => {
        window.open(getManagerTeamsUrl(currentTeamAccountId), '_blank');
    };

    return (
        <GenericModal
            id='memberInGroupModal'
            onExited={onExited}
            handleCancel={onExited}
            modalHeaderText={
                <FormattedMessage
                    id='ik_member_in_group.title'
                    defaultMessage='Remove access to channel {channelName}'
                    values={{channelName: channel.display_name}}
                />
            }
            compassDesign={true}
        >
            <FormattedMessage
                id='ik_member_in_group.body'
                defaultMessage='This member is part of teams that have access to this channel. To remove their access, remove them from all these teams.'
            />
            <GroupsList>
                {groups.map((group) => (
                    <GroupRow key={group.id}>
                        <GroupIcon/>
                        <GroupInfo>
                            <GroupName>{group.display_name}</GroupName>
                            <GroupMemberCount>
                                <FormattedMessage
                                    id='ik_member_in_group.member_count'
                                    defaultMessage='{count} {count, plural, one {member} other {members}}'
                                    values={{count: group.member_count || 0}}
                                />
                            </GroupMemberCount>
                        </GroupInfo>
                        {isSystemAdmin && (
                            <ManageLink onClick={handleManage}>
                                <FormattedMessage
                                    id='ik_member_in_group.manage'
                                    defaultMessage='Manage'
                                />
                            </ManageLink>
                        )}
                    </GroupRow>
                ))}
            </GroupsList>
        </GenericModal>
    );
};

export default IkMemberInGroupModal;

const GroupsList = styled.div`
    margin-top: 16px;
`;

const GroupRow = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 0;
`;

const GroupInfo = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: 8px;
    overflow: hidden;
`;

const GroupName = styled.span`
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--center-channel-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const GroupMemberCount = styled.span`
    font-size: 12px;
    line-height: 16px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const ManageLink = styled.button`
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    color: var(--button-bg);
    background: none;
    border: none;
    padding: 0;
    margin-left: 12px;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;
