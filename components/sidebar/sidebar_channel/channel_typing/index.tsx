// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {GlobalState} from '@mattermost/types/store';
import {isChannelBeingTypedIn} from 'mattermost-redux/selectors/entities/typing';

import './channel_typing.scss';

type Props = {
    channelId: string;
}

const ChannelTyping = ({channelId}: Props) => {
    const channelBeingTypedIn = useSelector((state: GlobalState) => isChannelBeingTypedIn(state, channelId));

    if (!channelBeingTypedIn) {
        return null;
    }

    return (
        <div className='channel-typing'>
            <div className='dot'/>
            <div className='dot'/>
            <div className='dot'/>
        </div>
    );
};

export default ChannelTyping;
