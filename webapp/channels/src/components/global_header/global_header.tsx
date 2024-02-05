// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {useCurrentProductId} from 'utils/products';

import CenterControls from './center_controls/center_controls';
import {useIsLoggedIn} from './hooks';
import LeftControls from './left_controls/left_controls';
import RightControls from './right_controls/right_controls';

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
        color: rgba(var(--center-channel-color-rgb), 0.785);
        background: transparent;
        padding-top: 0;
        padding-bottom: 0;
        height: 100%;
        border-radius: unset;
        width: 42px;
        &:hover {
            color: rgba(var(--center-channel-color-rgb), 0.84);
            background: rgba(var(--center-channel-color-rgb), 0.08);
        }
        &.active {
            color: rgba(var(--center-channel-color-rgb), 0.84);
            background: rgba(var(--center-channel-color-rgb), 0.08);
        }
    }

    @media screen and (max-width: 768px) {
        display: none;
    }
    .multi-teams & {
        margin-left: 65px;
    }
`;

const GlobalHeader = ({headerRef}: {headerRef: React.RefObject<HTMLDivElement>}): JSX.Element | null => {
    const isLoggedIn = useIsLoggedIn();
    const currentProductID = useCurrentProductId();

    if (!isLoggedIn) {
        return null;
    }

    return (
        <GlobalHeaderContainer id='global-header'>
            <LeftControls headerRef={headerRef}/>
            <CenterControls/>
            <RightControls productId={currentProductID}/>
        </GlobalHeaderContainer>
    );
};

export default GlobalHeader;
