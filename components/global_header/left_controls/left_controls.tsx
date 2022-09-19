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
    width: 240px;
    background: var(--sidebar-bg);
    border-bottom: solid 1px rgba(var(--sidebar-text-rgb), 0.25);

    > * + * {
        margin-left: 10px;
    }
`;

const LeftControls = (): JSX.Element => (
    <LeftControlsContainer>
        {/* <ProductMenu/> */}
        <AppNameDisplay/>
        {isDesktopApp() && <HistoryButtons/>}
    </LeftControlsContainer>
);

export default LeftControls;
