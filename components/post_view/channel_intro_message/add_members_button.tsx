// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage, useIntl} from 'react-intl';

import EmptyStateThemeableSvg from 'components/common/svg_images_components/empty_state_themeable_svg';

import {Channel} from '@mattermost/types/channels';
import {Permissions} from 'mattermost-redux/constants';

import ToggleModalButton from 'components/toggle_modal_button';
import ChannelInviteModal from 'components/channel_invite_modal';
import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

import {Constants, ModalIdentifiers} from 'utils/constants';

import './add_members_button.scss';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';

export interface AddMembersButtonProps {
    totalUsers?: number;
    usersLimit: number;
    channel: Channel;
    setHeader?: React.ReactNode;
    pluginButtons?: React.ReactNode;
}

const AddMembersButton: React.FC<AddMembersButtonProps> = ({totalUsers, usersLimit, channel, setHeader, pluginButtons}: AddMembersButtonProps) => {
    const {formatMessage} = useIntl();

    if (!totalUsers) {
        return (<LoadingSpinner/>);
    }

    const modalId = channel.group_constrained ? ModalIdentifiers.ADD_GROUPS_TO_CHANNEL : ModalIdentifiers.CHANNEL_INVITE;
    const modal = channel.group_constrained ? AddGroupsToChannelModal : ChannelInviteModal;
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    return (
        <ChannelPermissionGate
            channelId={channel.id}
            teamId={channel.team_id}
            permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS]}
        >
            {pluginButtons}
            {setHeader}
            <div className='LessThanMaxFreeUsers'>
                <EmptyStateThemeableSvg/>
                <div
                    className='titleAndButton'
                    style={{justifyContent: 'center'}}
                >
                    <FormattedMessage
                        id='intro_messages.inviteOthersToWorkspace.title'
                        defaultMessage='Let’s add some people to the channel!'
                    />

                    <ToggleModalButton
                        className='intro-links color--link'
                        modalId={modalId}
                        dialogType={modal}
                        dialogProps={{channel}}
                    >
                        <i
                            className='icon-account-plus-outline'
                            title={formatMessage({id: 'generic_icons.add', defaultMessage: 'Add Icon'})}
                        />
                        {channel.group_constrained &&
                            <FormattedMessage
                                id='intro_messages.inviteGropusToChannel.button'
                                defaultMessage='Add groups to this channel'
                            />}
                        {isPrivate && !channel.group_constrained &&
                            <FormattedMessage
                                id='intro_messages.inviteMembersToPrivateChannel.button'
                                defaultMessage='Add members to this private channel'
                            />}
                        {!isPrivate &&
                            <FormattedMessage
                                id='intro_messages.inviteMembersToChannel.button'
                                defaultMessage='Add members to this channel'
                            />}
                    </ToggleModalButton>
                </div>
            </div>
        </ChannelPermissionGate>
    );
};

export default React.memo(AddMembersButton);
