// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {
    ChevronRightIcon,
    CogOutlineIcon,
} from '@mattermost/compass-icons/components';
import type {Channel} from '@mattermost/types/channels';

import {Permissions} from 'mattermost-redux/constants';

import {openModal} from 'actions/views/modals';

import ConvertChannelModal from 'components/convert_channel_modal';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';
import * as Menu from 'components/menu';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import RenameChannelModal from 'components/rename_channel_modal';

import {Constants, ModalIdentifiers} from 'utils/constants';

type Props = {
    channel: Channel;
    isReadonly: boolean;
    isDefault: boolean;
}

const ChannelSettingsSubmenu = ({channel, isReadonly, isDefault}: Props): JSX.Element => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const channelPropertiesPermission = channel.type === Constants.PRIVATE_CHANNEL ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES;
    const handleRenameChannel = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.RENAME_CHANNEL,
                dialogType: RenameChannelModal,
                dialogProps: {channel},
            }),
        );
    };

    const handleEditHeader = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.EDIT_CHANNEL_HEADER,
                dialogType: EditChannelHeaderModal,
                dialogProps: {channel},
            }),
        );
    };

    const handleEditPurpose = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.EDIT_CHANNEL_PURPOSE,
                dialogType: EditChannelPurposeModal,
                dialogProps: {channel},
            }),
        );
    };

    const handleConvertToPublicOrPrivate = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.CONVERT_CHANNEL,
                dialogType: ConvertChannelModal,
                dialogProps: {
                    channelId: channel.id,
                    channelDisplayName: channel.display_name,
                    channelType: channel.type,
                },
            }),
        );
    };

    const isPublic = channel.type === Constants.OPEN_CHANNEL;

    const convertText = (
        <FormattedMessage
            id={isPublic ? 'channel_header.convert' : 'channel_header.convert.public'}
            defaultMessage={isPublic ? 'Convert to Private Channel' : 'Convert to Public Channel'}
        />
    );

    const convertPermission = [isPublic ? Permissions.CONVERT_PUBLIC_CHANNEL_TO_PRIVATE : Permissions.CONVERT_PRIVATE_CHANNEL_TO_PUBLIC];
    return (
        <Menu.SubMenu
            id={'channelSettings'}
            labels={
                <FormattedMessage
                    id='channelSettings'
                    defaultMessage='Channel Settings'
                />
            }
            leadingElement={<CogOutlineIcon size={18}/>}
            trailingElements={<ChevronRightIcon size={16}/>}
            menuId={'channelSettings-menu'}
            menuAriaLabel={formatMessage({id: 'channelSettings', defaultMessage: 'Channel Settings'})}
        >
            {!isReadonly && (
                <Menu.Item
                    id='channelRename'
                    onClick={handleRenameChannel}
                    labels={
                        <FormattedMessage
                            id='channel_header.rename'
                            defaultMessage='Rename Channel'
                        />
                    }
                />
            )}

            {!isReadonly && (
                <ChannelPermissionGate
                    channelId={channel.id}
                    teamId={channel.team_id}
                    permissions={[channelPropertiesPermission]}
                >
                    <Menu.Item
                        id='channelEditHeader'
                        onClick={handleEditHeader}
                        labels={
                            <FormattedMessage
                                id='channel_header.setHeader'
                                defaultMessage='Edit Channel Header'
                            />
                        }
                    />
                </ChannelPermissionGate>
            )}

            {!isReadonly && (
                <ChannelPermissionGate
                    channelId={channel.id}
                    teamId={channel.team_id}
                    permissions={[channelPropertiesPermission]}
                >
                    <Menu.Item
                        id='channelEditPurpose'
                        onClick={handleEditPurpose}
                        labels={
                            <FormattedMessage
                                id='channel_header.setPurpose'
                                defaultMessage='Edit Channel Purpose'
                            />
                        }
                    />
                </ChannelPermissionGate>
            )}
            {!isReadonly && !isDefault && (
                <ChannelPermissionGate
                    channelId={channel.id}
                    teamId={channel.team_id}
                    permissions={convertPermission}
                >
                    <Menu.Item
                        id='convertToPublicOrPrivate'
                        onClick={handleConvertToPublicOrPrivate}
                        labels={convertText}
                    />
                </ChannelPermissionGate>
            )}

        </Menu.SubMenu>
    );
};

export default memo(ChannelSettingsSubmenu);
