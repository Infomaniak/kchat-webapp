// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {CSSProperties} from 'react';
import React from 'react';

type Props = {
    className?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: CSSProperties;
}

const ChannelConvIcon: React.FC<Props> = (props: Props) => (
    <svg
        width={16}
        height={16}
        style={props.style}
        className={props.className}
        fill={props.fill || '#666'}
        xmlns='http://www.w3.org/2000/svg'
        {...props}
    >
        <g clipPath='url(#a)'>
            <path
                d='m15.907 14.585-1.29-2.764a7.844 7.844 0 1 0-2.794 2.794l2.765 1.29a.993.993 0 0 0 1.32-1.32ZM13.381 4.41a.167.167 0 0 1-.142.256h-1.566a.167.167 0 0 1-.164-.14 14.527 14.527 0 0 0-.492-2.031.166.166 0 0 1 .246-.193A6.56 6.56 0 0 1 13.38 4.41Zm.982 3.436a6.53 6.53 0 0 1-.223 1.695.166.166 0 0 1-.16.123H11.88a.167.167 0 0 1-.166-.18 20.563 20.563 0 0 0 0-3.305.167.167 0 0 1 .164-.18h2.091a.167.167 0 0 1 .16.122 6.5 6.5 0 0 1 .233 1.725Zm-13.03 0c0-.583.078-1.164.233-1.726A.167.167 0 0 1 1.726 6h2.091a.166.166 0 0 1 .166.18c-.043.543-.066 1.1-.066 1.667 0 .566.022 1.105.066 1.638a.168.168 0 0 1-.166.18H1.72a.166.166 0 0 1-.161-.123 6.493 6.493 0 0 1-.225-1.695Zm3.918 0c0-.576.025-1.145.074-1.696A.167.167 0 0 1 5.49 6h4.715a.166.166 0 0 1 .166.151 19.325 19.325 0 0 1 .003 3.363.167.167 0 0 1-.166.152h-4.72a.166.166 0 0 1-.166-.152c-.048-.543-.072-1.1-.072-1.667Zm3.795-6.4a.164.164 0 0 1 .115.082c.478.922.809 1.913.98 2.938a.166.166 0 0 1-.034.138.167.167 0 0 1-.129.062H5.719a.168.168 0 0 1-.164-.2 9.941 9.941 0 0 1 .982-2.941.164.164 0 0 1 .114-.082 6.533 6.533 0 0 1 2.395 0v.003ZM4.434 2.3a.167.167 0 0 1 .247.194 14.361 14.361 0 0 0-.492 2.032.167.167 0 0 1-.165.14H2.457a.167.167 0 0 1-.141-.255 6.569 6.569 0 0 1 2.118-2.11Zm-2.133 8.952a.166.166 0 0 1 .141-.254h1.577a.166.166 0 0 1 .164.138c.116.699.282 1.388.498 2.063a.167.167 0 0 1-.246.193 6.57 6.57 0 0 1-2.138-2.14h.004Zm4.354 3a.165.165 0 0 1-.115-.082 9.962 9.962 0 0 1-.987-2.972.166.166 0 0 1 .164-.2h4.267a.166.166 0 0 1 .164.2 10 10 0 0 1-.986 2.972.166.166 0 0 1-.115.082 6.496 6.496 0 0 1-2.396-.003l.004.003Zm5.408-.996a.668.668 0 0 0-.647.046c-.05.033-.102.067-.153.097a.167.167 0 0 1-.246-.193c.217-.676.383-1.367.499-2.067A.166.166 0 0 1 11.68 11h1.584a.166.166 0 0 1 .167.17c0 .03-.009.058-.024.084l-.101.158a.666.666 0 0 0-.047.648l.854 1.827a.168.168 0 0 1-.122.235.166.166 0 0 1-.1-.014l-1.828-.852Z'
                fill={props.fill || '#666'}
            />
        </g>
        <defs>
            <clipPath id='a'>
                <path
                    fill='#fff'
                    d='M0 0h16v16H0z'
                />
            </clipPath>
        </defs>
    </svg>
);

export default ChannelConvIcon;
