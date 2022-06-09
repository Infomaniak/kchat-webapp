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

const CallUnmutedIcon: React.FC<Props> = (props: Props) => (
    <svg
        width={16}
        height={16}
        style={props.style}
        className={props.className}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
    >
        <path
            d='M5.828 10.105A2.523 2.523 0 0 0 8.354 7.58V2.526A2.523 2.523 0 0 0 5.828 0a2.523 2.523 0 0 0-2.526 2.526V7.58a2.523 2.523 0 0 0 2.526 2.526Zm4.977-2.526a.84.84 0 0 0-.825.716 4.224 4.224 0 0 1-4.152 3.495 4.224 4.224 0 0 1-4.151-3.495.84.84 0 0 0-.826-.716.846.846 0 0 0-.842.96 5.888 5.888 0 0 0 4.977 4.867v1.752c0 .463.379.842.842.842a.845.845 0 0 0 .842-.842v-1.752a5.888 5.888 0 0 0 4.977-4.867c.084-.505-.328-.96-.842-.96Z'
            fill={props.fill || '#666'}
        />
    </svg>
);

export default CallUnmutedIcon;
