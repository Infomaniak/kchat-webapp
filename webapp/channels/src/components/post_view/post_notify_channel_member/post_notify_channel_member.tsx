// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import AtMention from 'components/at_mention';

export interface Props {
    username: string;
    channelName: string;
    postLink: string;
}

export default class PostNotifyChannelMember extends React.PureComponent<Props> {
    generateAtMentions(username: string) {
        return (
            <AtMention
                mentionName={username}
            />
        );
    }

    render() {
        const {username, channelName, postLink} = this.props;
        const outOfChannelAtMentions = this.generateAtMentions(username);
        const relativePath = new URL(postLink).pathname;
        let notifyMessage = null;
        const notifyTextMessage = 'mentioned your name in the channel';

        notifyMessage = (
            <p>
                {outOfChannelAtMentions}
                {' '}
                <FormattedMessage
                    id={'post_body.notify_message'}
                    defaultMessage={notifyTextMessage}
                />
                {' ~'}
                {channelName}
                {' :'}
                {'\n'}
                <Link
                    to={relativePath}
                >
                    {postLink}
                </Link>
            </p>
        );

        return (
            <>
                {notifyMessage}
            </>
        );
    }
}
