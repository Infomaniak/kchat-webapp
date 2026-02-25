// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import type {ImgHTMLAttributes, SyntheticEvent} from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Drop-in replacement for <img> with a single automatic retry on load error.
 * After the retry, the native onError handler is called (if provided).
 */
const ImgWithRetry = ({onError, ...props}: Props) => {
    const [retryCount, setRetryCount] = useState(0);

    const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
        if (retryCount === 0) {
            setRetryCount(1);
        } else {
            onError?.(e);
        }
    };

    return (
        <img
            {...props}
            key={retryCount}
            onError={handleError}
        />
    );
};

export default ImgWithRetry;
