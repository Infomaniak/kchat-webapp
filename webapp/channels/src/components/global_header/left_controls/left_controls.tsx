// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import AppNameDisplay from 'components/app_name_display';

import {isDesktopApp} from 'utils/user_agent';

import HistoryButtons from './history_buttons';

const LeftControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 46px;
    flex-shrink: 0;
    background: var(--sidebar-bg);
    border-bottom: solid 1px rgba(var(--sidebar-text-rgb), 0.25);
    padding-left: 10px;
    width: var(--overrideLhsWidth, 240px);
    min-width: 240px;
    max-width: 240px;
    @media screen and (min-width: 769px) {
        min-width: 200px;
        max-width: 264px;
    }

    @media screen and (min-width: 1201px) {
        max-width: 304px;
    }

    @media screen and (min-width: 1681px) {
        max-width: 440px;
    }
    > * + * {
        margin-left: 10px;
    }
`;

const LeftControls = ({headerRef}: {headerRef: React.RefObject<HTMLDivElement>}): JSX.Element => (
    <LeftControlsContainer ref={headerRef}>
        {/* <ProductMenu/> */}
        <AppNameDisplay/>
        {isDesktopApp() && <HistoryButtons/>}
    </LeftControlsContainer>
);

export default LeftControls;
