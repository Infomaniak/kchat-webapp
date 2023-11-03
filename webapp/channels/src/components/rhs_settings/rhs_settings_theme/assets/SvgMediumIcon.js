// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as React from 'react';

const SvgMediumThemeIcon = (props) => (
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
            <mask
                id='mask0_2355_17902'
                style={{maskType: 'alpha'}}
                maskUnits='userSpaceOnUse'
                x='0'
                y='0'
                width={36}
                height={36}
            >
                <circle
                    cx='18'
                    cy='18'
                    r='16'
                    fill='white'
                    stroke='#E0E0E0'
                    strokeWidth='3'
                />
            </mask>
            <g mask='url(#mask0_2355_17902)'>
                <rect
                    x='-2'
                    y='-2'
                    width='20.4'
                    height='43.35'
                    fill='#292E3D'
                />
            </g>
        </svg>
    </>
);

export default SvgMediumThemeIcon;
