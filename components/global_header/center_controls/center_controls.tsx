// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {ProductIdentifier} from '@mattermost/types/products';

import Pluggable from 'plugins/pluggable';

import {isChannels} from 'utils/products';

import GlobalSearchNav from './global_search_nav/global_search_nav';
import UserGuideDropdown from './user_guide_dropdown';

const CenterControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 46px;
    justify-content: flex-start;
    flex-grow: 1;
    border-bottom: solid 1px rgba(var(--center-channel-color-rgb), 0.12);
    border-left: solid 1px rgba(var(--center-channel-color-rgb), 0.12);
    flex-basis: 40%;

    > * + * {
        margin-left: 3px;
    }
`;

export type Props = {
    productId?: ProductIdentifier;
}

const CenterControls = (): JSX.Element => {
    return (
        <CenterControlsContainer>
            <GlobalSearchNav/>
        </CenterControlsContainer>
    );
};

export default CenterControls;
