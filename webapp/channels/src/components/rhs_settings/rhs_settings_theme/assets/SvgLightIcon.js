// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as React from 'react';

const SvgLightThemeIcon = (props) => (
    <>
        <svg
            width={36}
            height={36}
            viewBox='0 0 36 36'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <circle
                cx='18'
                cy='18'
                r='16'
                fill='white'
                stroke='#E0E0E0'
                strokeWidth='3'
            />
        </svg>
    </>
);

export default SvgLightThemeIcon;
