// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

// eslint-disable-next-line react/prop-types
const KDriveIcon = ({style, ...rest}: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...rest}>
        <svg
            className='file-kdrive__icon--svg'
            width={24}
            height={24}
            viewBox='0 0 80 80'
            style={style}
        >
            <g
                fill='none'
                fillRule='evenodd'
            >
                <path
                    d='M37.51 17.828l3.853 1.61c.59.247 1.045.735 1.252 1.34l1.532 4.477c.247.721.844 1.267 1.584 1.448l16.032 3.921a2.235 2.235 0 011.704 2.17v18.707a2.235 2.235 0 01-2.893 2.136L35.99 46.073a2.235 2.235 0 01-1.577-2.136V19.89a2.235 2.235 0 013.097-2.062z'
                    fill='#A2BFFF'
                    opacity={0.504}
                />
                <path
                    d='M31.922 22.298l3.854 1.61c.59.247 1.045.734 1.252 1.34l1.532 4.477c.247.721.844 1.267 1.584 1.448l16.031 3.92a2.235 2.235 0 011.704 2.172V55.97a2.235 2.235 0 01-2.892 2.136l-24.584-7.564a2.235 2.235 0 01-1.578-2.137V24.36a2.235 2.235 0 013.097-2.062z'
                    fill='#A0BDFF'
                    opacity={0.8}
                />
                <path
                    d='M26.335 26.097l3.853 1.611c.59.247 1.046.734 1.253 1.339l1.532 4.478c.246.72.843 1.266 1.583 1.447l16.032 3.921a2.235 2.235 0 011.704 2.171V59.77a2.235 2.235 0 01-2.892 2.136l-24.584-7.564a2.235 2.235 0 01-1.578-2.136V28.159a2.235 2.235 0 013.097-2.062z'
                    fill='#1A47FF'
                />
                <path
                    d='M20.667 36.008l24.831 6.897c.75.209 1.337.792 1.55 1.54l4.678 16.37a1.117 1.117 0 01-1.403 1.375l-26.01-8.003a2.235 2.235 0 01-1.45-1.392l-4.902-13.89a2.235 2.235 0 012.706-2.897z'
                    fill='#5287FF'
                />
            </g>
        </svg>
    </span>
);

export default KDriveIcon;

