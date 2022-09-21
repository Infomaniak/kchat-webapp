// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';

type Props = {
    className?: string;
    fill?: string;
    style?: CSSProperties;
}

export default function KMeetIcon(props: Props) {
    return (
        <svg
            width={32}
            height={32}
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                opacity={0.29}
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10.738 3.872c0-.882.856-1.512 1.702-1.253l14.471 4.437c.552.17.929.678.929 1.253v12.334c0 .882-.857 1.513-1.702 1.253L11.666 17.46a1.312 1.312 0 0 1-.928-1.253V3.872Z'
                fill='#3DBD86'
            />
            <path
                opacity={0.8}
                fillRule='evenodd'
                clipRule='evenodd'
                d='M7.449 5.97c0-.882.856-1.513 1.702-1.253l14.471 4.437c.552.17.929.678.929 1.253v12.334c0 .882-.856 1.512-1.702 1.253L8.377 19.557a1.312 1.312 0 0 1-.928-1.253V5.97Z'
                fill='#83D5B1'
            />
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M4.16 8.592c0-.882.856-1.513 1.702-1.253l14.472 4.437c.552.17.928.678.928 1.253v12.339c0 .88-.854 1.51-1.7 1.254l-3.891-1.183v3.344c0 .636-.817.9-1.19.384l-3.617-4.986a.658.658 0 0 0-.331-.24l-5.461-1.754a1.312 1.312 0 0 1-.912-1.248V8.592Z'
                fill='#3DBD86'
            />
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M14.435 14.513c0-.305-.25-.624-.56-.714l-6.039-1.742c-.31-.09-.56.085-.56.39v6.07c0 .304.25.624.56.713l6.038 1.743c.31.09.561-.085.561-.39v-1.215l2.691 2.18c.074.064.162.085.232.055.07-.03.114-.106.114-.202v-5.909a.39.39 0 0 0-.114-.268c-.07-.07-.158-.1-.232-.079l-2.69.779v-1.411Z'
                fill='#fff'
            />
        </svg>
    );
}

