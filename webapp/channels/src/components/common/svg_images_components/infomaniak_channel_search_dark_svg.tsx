// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

export function InfomaniakChannelSearchDarkSvg(props: React.HTMLAttributes<HTMLSpanElement>) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width='140'
                height='140'
                viewBox='0 0 140 140'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-label={formatMessage({id: 'generic_icons.channel_search', defaultMessage: 'Channel Search Icon'})}
            >
                <g clipPath='url(#clip0_5407_2901)'>
                    <path
                        d='M4.04134 25.895H96.0783C98.3103 25.895 100.12 27.7044 100.12 29.9363V93.7864C100.12 96.0183 98.3103 97.8276 96.0783 97.8276H35.9673L17.3404 117.671V97.8276H4.04134C1.80939 97.8276 5.34058e-05 96.0183 5.34058e-05 93.7864V29.9363C5.34058e-05 27.7044 1.8094 25.895 4.04134 25.895Z'
                        fill='#7BB4D1'
                    />
                    <path
                        d='M131.649 107.603L93.7408 83.2295L100.465 72.7706L138.374 97.1437C139.758 98.0336 140.158 99.8772 139.268 101.261L135.767 106.708C134.877 108.092 133.033 108.493 131.649 107.603ZM134.546 102.075C135.349 100.827 134.987 99.1652 133.74 98.3629C132.492 97.5606 130.83 97.9218 130.028 99.1696C129.225 100.417 129.586 102.079 130.834 102.882C132.082 103.684 133.744 103.323 134.546 102.075Z'
                        fill='#666666'
                        stroke='#E0E0E0'
                        strokeWidth='0.515922'
                    />
                    <path
                        d='M93.0045 28.5221C111.309 40.2907 116.607 64.6695 104.838 82.9736C93.0693 101.278 68.6905 106.576 50.3864 94.8071C32.0822 83.0385 26.7842 58.6597 38.5528 40.3556C50.3215 22.0514 74.7004 16.7534 93.0045 28.5221Z'
                        fill='#666666'
                        stroke='#E0E0E0'
                        strokeWidth='0.515922'
                    />
                    <path
                        d='M87.7514 36.6918C101.544 45.5595 105.536 63.9289 96.6679 77.721C87.8002 91.5132 69.4308 95.5052 55.6387 86.6376C41.8465 77.7699 37.8544 59.4005 46.7221 45.6084C55.5898 31.8162 73.9592 27.8242 87.7514 36.6918Z'
                        fill='#333333'
                        stroke='#9F9F9F'
                        strokeWidth='0.515922'
                    />
                    <path
                        d='M74.2133 41.1025C80.0326 44.8441 81.717 52.5947 77.9755 58.414C74.2339 64.2333 66.4833 65.9177 60.664 62.1761C54.8447 58.4346 53.1603 50.684 56.9018 44.8647C60.6434 39.0454 68.394 37.361 74.2133 41.1025Z'
                        fill='#1A1A1A'
                        stroke='#E0E0E0'
                        strokeWidth='0.515922'
                    />
                </g>
                <defs>
                    <clipPath id='clip0_5407_2901'>
                        <rect
                            width='140'
                            height='140'
                            fill='white'
                        />
                    </clipPath>
                </defs>
            </svg>

        </span>
    );
}
