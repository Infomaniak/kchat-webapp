// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';

/**
 * Detects load errors for CSS backgroundImage (which has no native onError).
 * Performs 1 immediate retry before returning error=true.
 */
const useBackgroundImageError = (src: string): boolean => {
    const [retryCount, setRetryCount] = useState(0);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src || error) {
            return;
        }
        const img = new Image();
        img.onerror = () => {
            if (retryCount === 0) {
                setRetryCount(1);
            } else {
                setError(true);
            }
        };
        img.src = src;
    }, [src, retryCount, error]);

    return error;
};

export default useBackgroundImageError;
