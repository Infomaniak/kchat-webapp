// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {GlobalState} from 'types/store';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import AddUserIllustrationDark from './add_user_illustration_dark.svg';
import AddUserIllustrationLight from './add_user_illustration_light.svg';

type SvgProps = {
    width: number;
    height: number;
}

const EmptyStateThemeableSvg = (props: SvgProps) => {
    const theme = useSelector((state: GlobalState) => getTheme(state));
    return (
        <>
            {theme.ikType === 'dark' ? (
                <img src={AddUserIllustrationDark} {...props}/>
            ) : (
                <img src={AddUserIllustrationLight} {...props}/>
            )}
        </>
    );
};

export default EmptyStateThemeableSvg;
