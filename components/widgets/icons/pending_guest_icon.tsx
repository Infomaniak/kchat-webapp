// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = React.HTMLAttributes<HTMLSpanElement>;

const PendingGuestIcon = (props: Props) => (
    <span {...props}>
        <svg
            viewBox='0 0 32 32'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <g clipPath='url(#clip0_5402_66483)'>
                <circle
                    cx='16'
                    cy='16'
                    r='16'
                    fill='#9F9F9F'
                />
                <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M23.8785 8.74395C23.7833 8.66445 23.6518 8.64441 23.5372 8.69195L8.20502 15.0256C8.07965 15.0779 7.99855 15.2011 8.00002 15.3369C8.00148 15.4727 8.08522 15.5941 8.21168 15.6437L12.4327 17.2831C12.5364 17.3235 12.6534 17.3095 12.7447 17.2458L18.3443 13.2629C18.4865 13.16 18.6841 13.1851 18.7961 13.3202C18.9081 13.4553 18.8963 13.6541 18.7689 13.7749L14.1026 18.2718C14.0374 18.3347 14.0006 18.4213 14.0006 18.5118V23.0008C14.001 23.151 14.1018 23.2823 14.2468 23.3216C14.3918 23.3608 14.5451 23.2982 14.6212 23.1688L16.7324 19.5519C16.7782 19.4739 16.8777 19.4464 16.957 19.4899L20.8408 21.6233C20.933 21.6742 21.0438 21.6784 21.1396 21.6348C21.2355 21.5912 21.3051 21.5049 21.3274 21.402L23.9939 9.06797C24.0172 8.94703 23.973 8.82295 23.8785 8.74395Z'
                    fill='white'
                />
            </g>
            <defs>
                <clipPath id='clip0_5402_66483'>
                    <rect
                        width='32'
                        height='32'
                        fill='white'
                    />
                </clipPath>
            </defs>
        </svg>
    </span>
);

export default PendingGuestIcon;
