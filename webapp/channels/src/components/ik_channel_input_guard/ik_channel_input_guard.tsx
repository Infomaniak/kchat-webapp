import type {ReactNode} from 'react';
import React from 'react';

import type {
    Channel,
} from '@mattermost/types/channels';

import * as GlobalActions from 'actions/global_actions';

import {BannerJoinChannel} from 'components/banner_join_channel';

export type Props = {
    isMember: boolean;
    channel: Channel | undefined;
    children: ReactNode;
}
export default function IkChannelInputGuard({channel, isMember, children}: Props) {
    const isPrivateChannel = channel?.type === 'P';
    const shouldHide = !isMember && isPrivateChannel;
    const shouldShowJoinBanner = !isMember && !isPrivateChannel;
    if (!channel) {
        return null;
    }
    if (shouldHide) {
        return null;
    }
    if (shouldShowJoinBanner) {
        return (
            <BannerJoinChannel onButtonClick={() => GlobalActions.joinChannel(channel.id)}/>
        );
    }
    return <>{children}</>;
}
