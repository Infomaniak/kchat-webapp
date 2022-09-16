// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import styled from 'styled-components';

import CenterControls from './center_controls/center_controls';
import LeftControls from './left_controls/left_controls';
import RightControls from './right_controls/right_controls';

import {useCurrentProductId, useIsLoggedIn, useProducts} from './hooks';

const GlobalHeaderContainer = styled.header`
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    height: 46px;
    background: var(--global-header-background);
    color: rgba(var(--global-header-text-rgb), 0.64);
    z-index: 99;

    > * + * {
        padding-left: 12px;
    }

    & .grey {
        color: #7B7B7B;
        background: transparent;
        &:hover {
            background: var(--sidebar-text-08);
        }
    }

    @media screen and (max-width: 768px) {
        display: none;
    }
    .multi-teams & {
        margin-left: 65px;
    }
`;

const GlobalHeader = (): JSX.Element | null => {
    const isLoggedIn = useIsLoggedIn();
    const products = useProducts();
    const currentProductID = useCurrentProductId(products);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <GlobalHeaderContainer id='global-header'>
            <LeftControls/>
            <CenterControls productId={currentProductID}/>
            <RightControls productId={currentProductID}/>
        </GlobalHeaderContainer>
    );
};

export default GlobalHeader;
