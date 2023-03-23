// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getIsRhsMenuOpen} from 'selectors/rhs';

import './flag_next.scss';

const FlagNext = () => {
    const isRhsOpen = useSelector(getIsRhsMenuOpen);

    if (document.cookie.indexOf('KCHAT_NEXT=always') === -1) {
        return null;
    }

    return (
        <div className={`flag-next ${isRhsOpen ? 'rhs-opened' : ''}`}>
            <p className='flag-next__text'>
                {'NEXT'}
            </p>
        </div>
    );
};

export default FlagNext;
