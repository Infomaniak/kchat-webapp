// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {FC} from 'react';

type Props = {
    total: number;
}

const Counter: FC<Props> = ({total}) => {
    return (
        <span className='switch-counter'>
            {total}
        </span>
    );
};

export default Counter;
