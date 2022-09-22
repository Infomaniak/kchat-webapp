// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/self-closing-comp */

import React from 'react';
import styled from 'styled-components';

import IconButton from '@infomaniak/compass-components/components/icon-button';

import Pluggable from 'plugins/pluggable';
import {
    CustomizeYourExperienceTour,
    OnboardingTourSteps,
    useShowOnboardingTutorialStep,
} from 'components/onboarding_tour';
import StatusDropdown from 'components/status_dropdown';

import {isDesktopApp} from 'utils/user_agent';

import AtMentionsButton from './at_mentions_button/at_mentions_button';
import SavedPostsButton from './saved_posts_button/saved_posts_button';
import SettingsButton from './settings_button';

// import PlanUpgradeButton from './plan_upgrade_button';

const RightControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 46px;
    flex-shrink: 0;
    position: relative;
    padding-right: 10px;
    border-bottom: solid 1px rgba(var(--center-channel-color-rgb), 0.12);

    .header-icon {
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        margin-left: auto;
        margin-right: 16px
        & .icon {
            cursor: pointer;
            background-color: #f5f5f5;
            color: #666;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            position: relative;
            border-radius: 50%;
            display: -webkit-box;
            display: flex;
            align-items: center;
            justify-content: center;
            &:hover {
                background: #e0e0e0;
            }
        }
    }
    .reporting-tools-logo img.without-custom-size {
        height: 25px;
        background: #7974B4;
    }
`;

export type Props = {
    productId?: string | null;
}

const RightControls = ({productId = null}: Props): JSX.Element => {
    const showCustomizeTip = useShowOnboardingTutorialStep(OnboardingTourSteps.CUSTOMIZE_EXPERIENCE);

    const trigger = (
        <span
            className='header-icon'
            slot='trigger'
            style={{height: 45, display: 'flex'}}
        >
            <IconButton
                className='grey'
                size={'sm'}
                icon={'layout-module'}
                inverted={true}
                compact={true}
                aria-label='Switch products' // proper wording and translation needed
            />
        </span>
    );

    return (
        <RightControlsContainer
            id={'RightControlsContainer'}
        >
            {/* <PlanUpgradeButton/> */}
            {!isDesktopApp() && (
                <div style={{position: 'relative'}}>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    <module-products-component
                        position='right'
                        style={{height: '100%'}}
                    >
                        {trigger}
                        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                        {/* @ts-ignore */}
                    </module-products-component>
                </div>
            )}
            {productId === null ? (
                <>
                    <AtMentionsButton/>
                    <SavedPostsButton/>
                    <SettingsButton/>
                    {showCustomizeTip && <CustomizeYourExperienceTour/>}
                </>
            ) : (
                <Pluggable
                    pluggableName={'Product'}
                    subComponentName={'headerRightComponent'}
                    pluggableId={productId}
                />
            )}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <module-reporting-tools-component></module-reporting-tools-component>
            <StatusDropdown/>
        </RightControlsContainer>
    );
};

export default RightControls;
