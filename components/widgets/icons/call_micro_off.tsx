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

const CallMutedIcon: React.FC<Props> = (props: Props) => (
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
            d='M10.42 7.242V2.526A2.523 2.523 0 0 0 7.894 0c-1.297 0-2.35.977-2.493 2.232l5.02 5.01Zm2.594.337a.706.706 0 0 0-.699.598c-.042.27-.101.539-.185.783l1.07 1.07a5.634 5.634 0 0 0 .53-1.634.722.722 0 0 0-.716-.817ZM.913 1.314a.839.839 0 0 0 0 1.187l4.455 4.463v.362c0 1.002.505 1.954 1.372 2.45.632.363 1.188.371 1.701.262l1.398 1.398a4.63 4.63 0 0 1-1.945.438c-2.139 0-4.11-1.49-4.421-3.697a.706.706 0 0 0-.699-.598.722.722 0 0 0-.716.817c.388 2.492 2.493 4.463 4.994 4.842v1.92c0 .463.379.842.842.842a.845.845 0 0 0 .842-.842v-1.92a6.005 6.005 0 0 0 2.147-.758l2.94 2.939a.839.839 0 1 0 1.187-1.187L2.1 1.314a.839.839 0 0 0-1.187 0Z'
            fill={props.fill || '#666'}
        />
    </svg>
);

export default CallMutedIcon;
