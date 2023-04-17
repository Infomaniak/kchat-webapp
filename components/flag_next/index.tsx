// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './flag_next.scss';

const FlagNext = () => {
    if (document.cookie.indexOf('KCHAT_NEXT=always') === -1) {
        return null;
    }

    return (
        <div className='flag-next'>
            <p className='flag-next__text'>
                {'NEXT'}
            </p>
        </div>
    );
};

export default FlagNext;
