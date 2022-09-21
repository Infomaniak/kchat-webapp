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

const CallUsersIcon: React.FC<Props> = (props: Props) => (
    <svg
        width={16}
        height={12}
        style={props.style}
        className={props.className}
        fill={props.fill || '#666'}
        xmlns='http://www.w3.org/2000/svg'
        {...props}
    >
        <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M8.167 3.167a3.167 3.167 0 1 1-6.334 0 3.167 3.167 0 0 1 6.334 0Zm.558 1.859a4.13 4.13 0 0 0-.004-3.719.333.333 0 0 1 .067-.386A3.133 3.133 0 0 1 11 0a3.167 3.167 0 1 1 0 6.333 3.133 3.133 0 0 1-2.209-.921.333.333 0 0 1-.066-.386Zm.69 1.903A4.933 4.933 0 0 1 11 6.667a5.005 5.005 0 0 1 5 5c0 .184-.15.333-.333.333h-4.334a.333.333 0 0 1-.333-.333 5.972 5.972 0 0 0-1.718-4.19.333.333 0 0 1 .133-.548ZM5 6.667a5 5 0 0 1 5 5c0 .184-.15.333-.333.333H.333A.333.333 0 0 1 0 11.667a5 5 0 0 1 5-5Z'
            fill={props.fill || '#666'}
        />
    </svg>
);

export default CallUsersIcon;
