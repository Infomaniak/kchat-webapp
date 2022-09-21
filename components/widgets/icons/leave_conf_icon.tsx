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

const LeaveConvIcon: React.FC<Props> = (props: Props) => (
    <svg
        width={24}
        height={24}
        style={props.style}
        className={props.className}
        fill={props.fill || '#666'}
        xmlns='http://www.w3.org/2000/svg'
        {...props}
    >
        <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M3.63691 5.95641C4.07563 5.95651 4.49637 5.78231 4.80656 5.47212C5.11674 5.16194 5.29095 4.74119 5.29084 4.30248L5.2908 3.94228C7.09287 3.78475 8.90529 3.7851 10.7074 3.94333L10.7069 4.304C10.7072 5.21723 11.4475 5.95759 12.3608 5.95782L14.3456 5.95757C14.7845 5.9578 15.2054 5.78358 15.5157 5.47328C15.826 5.16298 16.0002 4.74205 16 4.30317L15.9999 3.21509C15.9951 2.11746 15.2225 1.17287 14.1476 0.950306C10.0898 0.128806 5.90878 0.127557 1.85081 0.946633C0.780001 1.176 0.0112938 2.11687 0 3.21195L0.000118779 4.3019C0.000613836 5.21476 0.740614 5.95476 1.65347 5.95526L3.63691 5.95641Z'
            fill={props.fill || '#666'}
        />
    </svg>
);

export default LeaveConvIcon;
