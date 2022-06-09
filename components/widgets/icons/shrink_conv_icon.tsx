// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {CSSProperties} from 'react';

type Props = {
    className?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: CSSProperties;
}

const ShrinkConvIcon: React.FC<Props> = (props: Props) => (
    <svg
        width={24}
        height={24}
        viewBox='0 0 24 24'
        style={props.style}
        className={props.className}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
    >
        <path
            d='M.616 23.383a1.251 1.251 0 0 0 1.768 0L6.5 19.267a.25.25 0 0 1 .354 0l1.439 1.439A1 1 0 0 0 10 20v-5a1 1 0 0 0-1-1H4a1 1 0 0 0-.707 1.707l1.439 1.439a.25.25 0 0 1 0 .354L.616 21.615a1.251 1.251 0 0 0 0 1.768ZM23.384.615a1.251 1.251 0 0 0-1.768 0L17.5 4.73a.25.25 0 0 1-.354 0l-1.439-1.44A1 1 0 0 0 14 4v5a1 1 0 0 0 1 1h5a1 1 0 0 0 .707-1.707l-1.439-1.44a.248.248 0 0 1 0-.353l4.116-4.116a1.25 1.25 0 0 0 0-1.77Z'
            fill={props.fill || '#666'}
        />
    </svg>
);

export default ShrinkConvIcon;
