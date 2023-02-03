// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    isChannelBeingTypedIn?: boolean;
}

const ChannelTyping = ({isChannelBeingTypedIn}: Props) => {
    if (!isChannelBeingTypedIn) {
        return null;
    }

    return (
        <div>
            {'beingTypedIn'}
            <div className='dot__first'/>
            <div className='dot__second'/>
            <div className='dot__third'/>
        </div>
    );
};

export default ChannelTyping;
