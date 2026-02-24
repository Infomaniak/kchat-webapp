// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {MouseEvent, KeyboardEvent} from 'react';
import {useSelector} from 'react-redux';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap} from 'selectors/emojis';

import BrokenImagePlaceholder from 'components/broken_image_placeholder';

import useBackgroundImageError from 'hooks/useBackgroundImageError';

import type {GlobalState} from 'types/store';

interface ComponentProps {
    emojiName: string;
    size?: number;
    emojiStyle?: React.CSSProperties;
    onClick?: (event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => void;
}

const RenderEmoji = ({emojiName, emojiStyle, size, onClick}: ComponentProps) => {
    const emojiMap = useSelector((state: GlobalState) => getEmojiMap(state));

    const emojiFromMap = emojiName ? emojiMap.get(emojiName) : undefined;
    const emojiImageUrl = emojiFromMap ? getEmojiImageUrl(emojiFromMap) : '';

    // Hook must be called before the early returns below to respect React rules of hooks
    const imageError = useBackgroundImageError(emojiImageUrl);

    if (!emojiName || !emojiFromMap) {
        return null;
    }

    if (imageError) {
        return (
            <span
                onClick={onClick}
                className='emoticon'
                aria-label={`:${emojiName}:`}
                data-emoticon={emojiName}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: size,
                    width: size,
                    background: 'var(--center-channel-bg)',
                    borderRadius: '2px',
                    ...emojiStyle,
                }}
            >
                <BrokenImagePlaceholder size={Math.round((size ?? 16) * 0.7)}/>
            </span>
        );
    }

    return (
        <span
            onClick={onClick}
            className='emoticon'
            aria-label={`:${emojiName}:`}
            data-emoticon={emojiName}
            style={{
                backgroundImage: `url(${emojiImageUrl})`,
                backgroundSize: 'contain',
                height: size,
                width: size,
                maxHeight: size,
                maxWidth: size,
                minHeight: size,
                minWidth: size,
                overflow: 'hidden',
                ...emojiStyle,
            }}
        />
    );
};

RenderEmoji.defaultProps = {
    emoji: '',
    emojiStyle: {},
    size: 16,
};

export default React.memo(RenderEmoji);
