// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import type {ComponentProps} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import './convert_gm_to_channel_modal.scss';

import {GenericModal} from '@mattermost/components';
import type {Channel} from '@mattermost/types/channels';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {trackEvent} from 'actions/telemetry_actions';

import ChannelNameFormField from 'components/channel_name_form_field/channel_name_form_field';
import type {Actions} from 'components/convert_gm_to_channel_modal/index';
import WarningTextSection from 'components/convert_gm_to_channel_modal/warning_text_section/warning_text_section';

const enum ServerErrorId {
    CHANNEL_NAME_EXISTS = 'store.sql_channel.save_channel.exists.app_error',
}

export type Props = {
    onExited: () => void;
    channel: Channel;
    actions: Actions;
    profilesInChannel: UserProfile[];
    teammateNameDisplaySetting: string;
    currentUserId: string;
    currentTeam: Team;
}

const ConvertGmToChannelModal = ({onExited, channel, actions, profilesInChannel, teammateNameDisplaySetting, currentUserId, currentTeam}: Props) => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const channelURL = useRef<string>('');
    const [channelName, setChannelName] = useState<string>('');
    const [urlError, setURLError] = useState('');
    const [channelMemberNames, setChannelMemberNames] = useState<string[]>([]);
    const [nameError, setNameError] = useState<boolean>(false);
    const [conversionError, setConversionError] = useState<string>();

    useEffect(() => {
        const validProfilesInChannel = profilesInChannel.
            filter((user) => user.id !== currentUserId && user.delete_at === 0).
            map((user) => displayUsername(user, teammateNameDisplaySetting));

        setChannelMemberNames(validProfilesInChannel);
    }, [profilesInChannel]);

    const handleChannelURLChange = useCallback((newURL: string) => {
        channelURL.current = newURL;
        setURLError('');
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!currentTeam.id) {
            return;
        }

        const {error} = await actions.convertGroupMessageToPrivateChannel(channel.id, currentTeam.id, channelName.trim(), channelURL.current.trim());

        if (error) {
            if (error.server_error_id === ServerErrorId.CHANNEL_NAME_EXISTS) {
                setURLError(
                    formatMessage({
                        id: 'channel_modal.alreadyExist',
                        defaultMessage: 'A channel with that URL already exists',
                    }),
                );
            } else {
                setConversionError(error.message);
            }

            return;
        }

        setConversionError(undefined);
        trackEvent('actions', 'convert_group_message_to_private_channel', {channel_id: channel.id});
        onExited();
    }, [currentTeam.id, channel.id, channelName, channelURL.current, actions.moveChannelsInSidebar]);

    const canCreate = currentTeam.id !== undefined && channelName !== '' && !nameError && !urlError;
    const modalProps: Partial<ComponentProps<typeof GenericModal>> = {};

    modalProps.handleCancel = onExited;
    modalProps.isDeleteModal = true;
    modalProps.cancelButtonText = formatMessage({id: 'channel_modal.cancel', defaultMessage: 'Cancel'});
    modalProps.confirmButtonText = formatMessage({id: 'sidebar_left.sidebar_channel_modal.confirmation_text', defaultMessage: 'Convert to private channel'});
    modalProps.isConfirmDisabled = !canCreate;

    const subBody = (
        <React.Fragment>
            <WarningTextSection channelMemberNames={channelMemberNames}/>

            <ChannelNameFormField
                value={channelName}
                name='convert-gm-to-channel-modal-channel-name'
                placeholder={formatMessage({id: 'sidebar_left.sidebar_channel_modal.channel_name_placeholder', defaultMessage: 'Enter a name for the channel'})}
                autoFocus={false}
                onDisplayNameChange={setChannelName}
                onURLChange={handleChannelURLChange}
                onErrorStateChange={setNameError}
                team={currentTeam}
                urlError={urlError}
            />

            {
                conversionError &&
                <div className='conversion-error'>
                    <i className='icon icon-alert-outline'/>
                    <span>{conversionError}</span>
                </div>
            }

        </React.Fragment>
    );

    const modalBody = (
        <div
            className={classNames({
                'convert-gm-to-channel-modal-body': true,
                'single-team': true,
            })}
        >
            {subBody}
        </div>
    );

    return (
        <GenericModal
            id='convert-gm-to-channel-modal'
            className='convert-gm-to-channel-modal'
            modalHeaderText={formatMessage({id: 'sidebar_left.sidebar_channel_modal.header', defaultMessage: 'Convert to Private Channel'})}
            compassDesign={true}
            handleConfirm={handleConfirm}
            onExited={onExited}
            autoCloseOnConfirmButton={false}
            {...modalProps}
        >
            {modalBody}
        </GenericModal>
    );
};

export default ConvertGmToChannelModal;
