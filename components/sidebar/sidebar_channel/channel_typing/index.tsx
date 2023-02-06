// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './channel_typing.scss';

type Props = {
    isChannelBeingTypedIn?: boolean;
}

const ChannelTyping = ({isChannelBeingTypedIn}: Props) => {
    if (!isChannelBeingTypedIn) {
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
