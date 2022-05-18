// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {isDesktopApp} from 'utils/user_agent';
import {Client4} from 'mattermost-redux/client';
interface PostEmojiProps {
    name: string;
    imageUrl: string;
}
declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        alt?: string;
    }
}

export default class PostEmoji extends React.PureComponent<PostEmojiProps> {
    public render() {
        const emojiText = ':' + this.props.name + ':';

        if (!this.props.imageUrl) {
            return emojiText;
        }
        const emojiUrl = this.props.imageUrl + (this.props.imageUrl.indexOf('access_token') === -1 && isDesktopApp() && Client4.getToken() ? `?access_token=${Client4.getToken()}` : '');
        return (
            <span
                alt={emojiText}
                className='emoticon'
                title={emojiText}
                style={{backgroundImage: 'url(' + emojiUrl + ')'}}
            >
                {emojiText}
            </span>
        );
    }
}
