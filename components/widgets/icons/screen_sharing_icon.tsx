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

const ScreenSharingIcon: React.FC<Props> = (props: Props) => (
    <svg
        width={16}
        height={16}
        style={props.style}
        className={props.className}
        fill={props.fill || '#666'}
        xmlns='http://www.w3.org/2000/svg'
        {...props}
    >
        <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M15 0H1a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h6.167c.092 0 .166.075.166.167V14.5a.167.167 0 0 1-.166.167H5A.667.667 0 1 0 5 16h6a.667.667 0 0 0 0-1.333H8.833a.167.167 0 0 1-.166-.167v-1.333c0-.092.074-.167.166-.167H15a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1Zm-.333 10c0 .184-.15.333-.334.333H1.667A.333.333 0 0 1 1.333 10V1.667c0-.184.15-.334.334-.334h12.666c.184 0 .334.15.334.334V10Z'
            fill={props.fill || '#666'}
        />
    </svg>
);

export default ScreenSharingIcon;
