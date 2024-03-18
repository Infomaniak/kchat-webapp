
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {FC} from 'react';
import React from 'react';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
    color?: string;
}

const PlusFilledIcon: FC<Props> = ({color, ...props}) => {
    return (
        <span
            className={'icon'}
            style={{display: 'inline-flex', color}}
            {...props}
        >
            <svg
                width='17'
                height='16'
                viewBox='0 0 17 16'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
            >
                <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M0.5 8C0.5 3.58172 4.08172 0 8.5 0C12.9183 0 16.5 3.58172 16.5 8C16.5 12.4183 12.9183 16 8.5 16C4.08172 16 0.5 12.4183 0.5 8ZM8.5 4.5C8.77614 4.5 9 4.72386 9 5V7.5H11.5C11.7761 7.5 12 7.72386 12 8C12 8.27614 11.7761 8.5 11.5 8.5H9V11C9 11.2761 8.77614 11.5 8.5 11.5C8.22386 11.5 8 11.2761 8 11V8.5H5.5C5.22386 8.5 5 8.27614 5 8C5 7.72386 5.22386 7.5 5.5 7.5H8V5C8 4.72386 8.22386 4.5 8.5 4.5Z'
                    fill='white'
                />
            </svg>
        </span>
    );
};

export default PlusFilledIcon;
