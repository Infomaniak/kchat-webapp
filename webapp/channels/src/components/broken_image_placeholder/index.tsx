// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    size?: number;
}

const BrokenImagePlaceholder = ({size = 32}: Props) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        width={size}
        height={size}
        fill='none'
        stroke='rgba(var(--center-channel-color-rgb), 0.32)'
        strokeWidth='1.5'
    >
        <rect
            x='3'
            y='3'
            width='18'
            height='18'
            rx='2'
        />
        <circle
            cx='8.5'
            cy='8.5'
            r='1.5'
        />
        <path d='M21 15l-5-5L5 21'/>
    </svg>
);

export default BrokenImagePlaceholder;
