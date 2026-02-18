// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import IKAppBranding from 'components/app_branding';

import {isDesktopApp, isPWA} from 'utils/user_agent';

import HistoryButtons from './history_buttons';

const LeftControlsContainer = styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    background: var(--sidebar-bg);
    height: 64px;
    width: var(--overrideLhsWidth, 264px);
    min-width: 200px;
    max-width: 200px;
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
        <IKAppBranding/>
        {(isDesktopApp() || isPWA()) && <HistoryButtons/>}
    </LeftControlsContainer>
);

export default LeftControls;
