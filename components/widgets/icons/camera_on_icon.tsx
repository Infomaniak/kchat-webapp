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

const CameraOnIcon: React.FC<Props> = (props: Props) => (
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
            d='M12.444 6.667V3.556c0-.49-.4-.89-.888-.89H.889c-.489 0-.889.4-.889.89v8.888c0 .49.4.89.889.89h10.667c.488 0 .888-.4.888-.89v-3.11l2.036 2.035c.56.56 1.52.16 1.52-.631V5.253c0-.79-.96-1.19-1.52-.63l-2.036 2.044Z'
            fill={props.fill || '#666'}
        />
    </svg>
);

export default CameraOnIcon;
