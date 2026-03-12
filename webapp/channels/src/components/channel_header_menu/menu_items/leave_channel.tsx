// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {LogoutVariantIcon} from '@infomaniak/compass-icons/components';
import React, {memo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';

import {requestLeaveChannel} from 'actions/views/channel';

import * as Menu from 'components/menu';

type Props = {
    channel: Channel;
    id?: string;
}

const LeaveChannel = ({
    channel,
    id,
}: Props) => {
    const dispatch = useDispatch();
    const handleLeave = () => {
        dispatch(requestLeaveChannel(channel));
    };

    return (
        <Menu.Item
            id={id}
            leadingElement={<LogoutVariantIcon size='18px'/>}
            onClick={handleLeave}
            labels={
                <FormattedMessage
                    id='channel_header.leave'
                    defaultMessage='Leave Channel'
                />
            }
            isDestructive={true}
        />
    );
};

export default memo(LeaveChannel);
