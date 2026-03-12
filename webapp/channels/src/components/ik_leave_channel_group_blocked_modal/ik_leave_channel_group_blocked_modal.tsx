import React from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

import {GenericModal} from '@mattermost/components';
import type {Group} from '@mattermost/types/groups';

import GroupIcon from 'components/common/group_icon';

type Props = {
    groups: Group[];
    onExited: () => void;
}

const IkLeaveChannelGroupBlockedModal = ({groups, onExited}: Props) => {
    return (
        <GenericModal
            id='leaveChannelGroupBlockedModal'
            onExited={onExited}
            handleCancel={onExited}
            modalHeaderText={
                <FormattedMessage
                    id='ik_leave_channel_group_blocked.title'
                    defaultMessage='Leave Channel'
                />
            }
            compassDesign={true}
        >
            <FormattedMessage
                id='ik_leave_channel_group_blocked.body'
                defaultMessage='This channel is linked to the following teams. To leave it, you need to be removed from all these teams. Contact an administrator if needed.'
            />
            <GroupsList>
                {groups.map((group) => (
                    <GroupRow key={group.id}>
                        <GroupIcon/>
                        <GroupInfo>
                            <GroupName>{group.display_name}</GroupName>
                            <GroupMemberCount>
                                <FormattedMessage
                                    id='ik_leave_channel_group_blocked.member_count'
                                    defaultMessage='{count} {count, plural, one {member} other {members}}'
                                    values={{count: group.member_count}}
                                />
                            </GroupMemberCount>
                        </GroupInfo>
                    </GroupRow>
                ))}
            </GroupsList>
        </GenericModal>
    );
};

export default IkLeaveChannelGroupBlockedModal;

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
