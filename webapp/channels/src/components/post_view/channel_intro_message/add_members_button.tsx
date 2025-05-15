// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';

import {Permissions} from 'mattermost-redux/constants';

import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import ChannelInviteModal from 'components/channel_invite_modal';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ToggleModalButton from 'components/toggle_modal_button';

import {Constants, ModalIdentifiers} from 'utils/constants';

import './add_members_button.scss';

export interface AddMembersButtonProps {
    channel: Channel;
    pluginButtons?: React.ReactNode;
}

const AddMembersButton: React.FC<AddMembersButtonProps> = ({channel, pluginButtons}: AddMembersButtonProps) => {
    return (
        <MoreThanMaxFreeUsers
            channel={channel}
            pluginButtons={pluginButtons}
        />
    );
};

const MoreThanMaxFreeUsers = ({channel, pluginButtons}: {channel: Channel; pluginButtons: React.ReactNode}) => {
    const {formatMessage} = useIntl();

    const modalId = channel.group_constrained ? ModalIdentifiers.ADD_GROUPS_TO_CHANNEL : ModalIdentifiers.CHANNEL_INVITE;
    const modal = channel.group_constrained ? AddGroupsToChannelModal : ChannelInviteModal;
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    return (
        <div className='MoreThanMaxFreeUsersWrapper'>
            <div className='MoreThanMaxFreeUsers'>
                <ChannelPermissionGate
                    channelId={channel.id}
                    teamId={channel.team_id}
                    permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
                >
                    <ToggleModalButton
                        className='action-button'
                        modalId={modalId}
                        dialogType={modal}
                        dialogProps={{channel}}
                    >
                        <i
                            className='icon-account-plus-outline'
                            title={formatMessage({id: 'generic_icons.add', defaultMessage: 'Add Icon'})}
                            aria-hidden='true'
                        />
                        {channel.group_constrained &&
                            <FormattedMessage
                                id='intro_messages.inviteGropusToChannel.button'
                                defaultMessage='Add groups'
                            />}
                        {!channel.group_constrained &&
                            <FormattedMessage
                                id='intro_messages.inviteMembersToChannel.button'
                                defaultMessage='Add people'
                            />}
                    </ToggleModalButton>
                </ChannelPermissionGate>
            </div>
            {pluginButtons}
        </div>
    );
};

export default React.memo(AddMembersButton);
