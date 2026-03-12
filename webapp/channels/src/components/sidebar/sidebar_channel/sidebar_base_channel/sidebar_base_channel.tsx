// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';

import {trackEvent} from 'actions/telemetry_actions';

import SidebarChannelLink from 'components/sidebar/sidebar_channel/sidebar_channel_link';

import Constants from 'utils/constants';

import SidebarBaseChannelIcon from './sidebar_base_channel_icon';

import type {PropsFromRedux} from './index';

export interface Props extends PropsFromRedux {
    channel: Channel;
    currentTeamName: string;
}

const SidebarBaseChannel = ({
    channel,
    currentTeamName,
    actions,
}: Props) => {
    const intl = useIntl();

    const handleLeave = useCallback((callback: () => void) => {
        actions.requestLeaveChannel(channel);
        trackEvent('ui', channel.type === Constants.OPEN_CHANNEL ? 'ui_public_channel_x_button_clicked' : 'ui_private_channel_x_button_clicked');
        callback();
    }, [channel, actions.requestLeaveChannel]);

    const isPublicChannel = channel.type === Constants.OPEN_CHANNEL;
    const isPrivateChannel = channel.type === Constants.PRIVATE_CHANNEL;
    const isLeavableChannel = (isPublicChannel || isPrivateChannel) && channel.name !== Constants.DEFAULT_CHANNEL;

    const channelIcon = (
        <SidebarBaseChannelIcon
            channelType={channel.type}
        />
    );

    let ariaLabelPrefix;
    if (isPublicChannel) {
        ariaLabelPrefix = intl.formatMessage({id: 'accessibility.sidebar.types.public', defaultMessage: 'public channel'});
    } else if (isPrivateChannel) {
        ariaLabelPrefix = intl.formatMessage({id: 'accessibility.sidebar.types.private', defaultMessage: 'private channel'});
    }

    return (
        <SidebarChannelLink
            channel={channel}
            link={`/${currentTeamName}/channels/${channel.name}`}
            label={channel.display_name}
            ariaLabelPrefix={ariaLabelPrefix}
            channelLeaveHandler={isLeavableChannel ? handleLeave : undefined}
            icon={channelIcon}
            isSharedChannel={channel.shared}
        />
    );
};

export default SidebarBaseChannel;
