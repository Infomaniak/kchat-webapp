// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {Channel} from '@mattermost/types/channels';
import {LeastActiveChannel} from '@mattermost/types/insights';

import Constants from 'utils/constants';

import ConfirmModal from 'components/confirm_modal';

type Props = {
    channel: Channel | LeastActiveChannel;
    onExited: () => void;
    callback?: () => any;
    actions: {
        leaveChannel: (channelId: string) => any;
    };
}

const LeaveChannelModal = ({actions, channel, callback, onExited}: Props) => {
    const [show, setShow] = useState(true);

    const handleSubmit = () => {
        if (channel) {
            const channelId = channel.id;
            actions.leaveChannel(channelId).then((result: {data: boolean}) => {
                if (result.data) {
                    callback?.();
                    handleHide();
                }
            });
        }
    };

    const handleHide = () => setShow(false);

    let title;
    let message;
    if (channel && channel.display_name) {
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            title = (
                <FormattedMessage
                    id='leave_private_channel_modal.title'
                    defaultMessage='Leave Private Channel {channel}'
                    values={{
                        channel: <b>{channel.display_name}</b>,
                    }}
                />
            );
        } else {
            title = (
                <FormattedMessage
                    id='leave_public_channel_modal.title'
                    defaultMessage='Leave Channel {channel}'
                    values={{
                        channel: <b>{channel.display_name}</b>,
                    }}
                />
            );
        }

        if (channel.type === Constants.PRIVATE_CHANNEL) {
            message = (
                <FormattedMessage
                    id='leave_private_channel_modal.message'
                    defaultMessage='Do you really want to leave the {channel} channel?'
                    values={{
                        channel: <b>{channel.display_name}</b>,
                    }}
                />
            );
        } else {
            message = (
                <FormattedMessage
                    id='leave_public_channel_modal.message'
                    defaultMessage='Are you sure you wish to leave the channel {channel}? You can re-join this channel in the future if you change your mind.'
                    values={{
                        channel: <b>{channel.display_name}</b>,
                    }}
                />
            );
        }
    }

    let content;
    if (channel.type === Constants.PRIVATE_CHANNEL) {
        content = (
            <div>
                <div className='alert alert-with-icon alert-grey'>
                    <i className='icon-information-outline'/>
                    <FormattedMessage
                        id='leave_private_channel_modal.information'
                        defaultMessage='Only a channel administrator can invite you to join this channel again.'
                    />
                </div>
                {message}
            </div>
        );
    } else {
        content = (<React.Fragment/>);
    }

    const buttonClass = 'btn btn-danger';
    const button = (
        <FormattedMessage
            id='leave_private_channel_modal.leave'
            defaultMessage='Leave'
        />
    );

    return (
        <ConfirmModal
            show={show}
            title={title}
            message={content}
            confirmButtonClass={buttonClass}
            confirmButtonText={button}
            onConfirm={handleSubmit}
            onCancel={handleHide}
            onExited={onExited}
        />
    );
};

export default LeaveChannelModal;
