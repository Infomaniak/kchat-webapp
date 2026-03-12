// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AccountMultipleOutlineIcon} from '@infomaniak/compass-icons/components';
import React from 'react';
import styled from 'styled-components';

const GROUP_ICON_BACKGROUND = '#ff9802';

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 50%;
    background: ${GROUP_ICON_BACKGROUND};
`;

interface Props {
    size?: number;
}

const GroupIcon = ({size = 19}: Props) => (
    <IconWrapper>
        <AccountMultipleOutlineIcon
            size={size}
            color='white'
        />
    </IconWrapper>
);

export default GroupIcon;
