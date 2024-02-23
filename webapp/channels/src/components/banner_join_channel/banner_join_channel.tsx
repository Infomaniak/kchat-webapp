// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {FC} from 'react';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export type BannerJoinChannelProps = {
    onButtonClick?: () => void;
}

const BannerJoinChannel: FC<BannerJoinChannelProps> = ({onButtonClick}) => {
    return (
        <div
            className='post-create__container'
            id='post-create'
        >
            <div
                id='channelArchivedMessage'
                className='channel-archived__message'
            >
                <button
                    className='btn btn-primary channel-archived__close-btn'
                    onClick={onButtonClick}
                >
                    <FormattedMessage
                        id='joinChannel.joiningButtonChannel'
                        defaultMessage='Join Channel'
                    />
                </button>
            </div>
        </div>
    );
};

export default BannerJoinChannel;
