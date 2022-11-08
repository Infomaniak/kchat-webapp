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
    width: 320px;
    background: var(--sidebar-bg);
    border-bottom: solid 1px rgba(var(--sidebar-text-rgb), 0.25);
    padding-left: 10px;

    > * + * {
        margin-left: 10px;
    }

    .multi-teams & {
        width: 255px
    }

    .no-webcomponents & {
        width: 255px
    }
`;

const HeaderIcon = styled.span`
    height: 31px;
    display: flex;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    justify-content: center;
    padding-right: 6px;
    > i {
        cursor: pointer;
        background-color: rgba(var(--sidebar-text-rgb), 0.08);
        color: rgba(var(--sidebar-text-rgb), 0.72);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        position: relative;
        border-radius: 50%;
        display: -webkit-box;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const LeftControls = (): JSX.Element => (
    <LeftControlsContainer>
        {/* <ProductMenu/> */}
        <AppNameDisplay/>
        {isDesktopApp() && <HistoryButtons/>}
        {!isDesktopApp() && (
            <div
                style={{position: 'relative', marginLeft: 'auto', marginRight: 9}}
            >
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <module-products-component position='right'>
                    <HeaderIcon
                        className='header-icon'
                        slot='trigger'
                    >
                        <i className='icon icon-chevron-down'/>
                    </HeaderIcon>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                </module-products-component>
            </div>
        )}
    </LeftControlsContainer>
);

export default LeftControls;
