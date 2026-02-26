// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import type {ImgHTMLAttributes, SyntheticEvent} from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & {

    /**
     * When true (default), automatically retries once on load error before
     * falling back to the native browser broken-image behaviour.
     */
    retry?: boolean;
}

const Image = ({retry = true, onError, ...props}: Props) => {
    const [retryCount, setRetryCount] = useState(0);

    const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
        if (retry && retryCount === 0) {
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

export default Image;
