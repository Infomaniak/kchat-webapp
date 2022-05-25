// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';

const SvgCallComponent = (props) => (
    <svg
        width={20}
        height={20}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
    >
        <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M16.943 12.17a2.394 2.394 0 0 0-3.387 0l-.368.368a44.925 44.925 0 0 1-5.544-5.546l.37-.368a2.395 2.395 0 0 0 0-3.386L5.982 1.206a2.394 2.394 0 0 0-3.388 0L1.481 2.32a3.364 3.364 0 0 0-.423 4.215 44.926 44.926 0 0 0 12.585 12.592 3.39 3.39 0 0 0 4.213-.425l1.116-1.116a2.395 2.395 0 0 0 0-3.385l-2.03-2.031Z'
            fill='inherit'
        />
    </svg>
);

export default SvgCallComponent;
