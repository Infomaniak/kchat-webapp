// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';

import './channel_message_limitation_banner.scss';

type Props = {
    olderMessagesDate: string;
}

export default class ChannelMessageLimitaionBanner extends React.PureComponent<Props> {
    handleButtonClick() {
        window.open('https://www.youtube.com/watch?v=xvFZjo5PgG0', '_blank')?.focus();
    }

    render() {
        const {
            olderMessagesDate,
        } = this.props;

        return (
            <p className='channel-limitation-banner'>
                <span>
                    <strong>
                        {'This is just a placeholder:'}
                        {' '}
                        {olderMessagesDate}
                    </strong>
                    <button
                        className='channel-limitation-banner__button'
                        onClick={this.handleButtonClick}
                    >
                        {'See offers'}
                    </button>
                </span>
            </p>
        );
    }
}
