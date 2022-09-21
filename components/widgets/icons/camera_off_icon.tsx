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

const CameraOffIcon: React.FC<Props> = (props: Props) => (
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
            d='M16 10.274V5.72c0-.766-.93-1.153-1.472-.611l-1.972 1.98V4.075a.864.864 0 0 0-.861-.861h-4.83l7.671 7.671c.534.543 1.464.155 1.464-.61ZM.252.252a.857.857 0 0 0 0 1.214l1.74 1.748h-.63a.864.864 0 0 0-.86.86v8.611c0 .474.387.861.86.861h10.333c.18 0 .336-.069.473-.155l2.136 2.135a.857.857 0 1 0 1.214-1.214L1.466.252a.858.858 0 0 0-1.214 0Z'
            fill={props.fill || '#666'}
        />
    </svg>
);

export default CameraOffIcon;
