// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/self-closing-comp */

import React from 'react';
import styled from 'styled-components';

import IconButton from '@infomaniak/compass-components/components/icon-button';

import {FormattedMessage} from 'react-intl';
import {ProductIdentifier} from '@mattermost/types/products';

import Pluggable from 'plugins/pluggable';
import {
    CustomizeYourExperienceTour,
    OnboardingTourSteps,
    useShowOnboardingTutorialStep,
} from 'components/onboarding_tour';
import StatusDropdown from 'components/status_dropdown';

import {isDesktopApp} from 'utils/user_agent';

import imagePath from 'images/icons/messages-bubble-user-feedback.svg';

import Tooltip from 'components/tooltip';

import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';
import {isChannels} from 'utils/products';

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
`;

export type Props = {
    productId?: ProductIdentifier;
}

const tooltipUserReport = (
    <Tooltip id='userReport'>
        <FormattedMessage
            id='global_header.userReport'
            defaultMessage='Feedback'
        />
    </Tooltip>
);

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
            {isChannels(productId) ? (
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
            {!isDesktopApp() && (
                <div style={{height: 46, width: 42, background: '#7974B4', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    <module-reporting-tools-component size='26'></module-reporting-tools-component>
                </div>
            )}
            <OverlayTrigger
                trigger={['hover', 'focus']}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='bottom'
                overlay={tooltipUserReport}
            >
                <a
                    className='header-icon grey'
                    style={{height: 45, width: 42, display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none'}}
                    target='_blank'
                    href='https://feedback.userreport.com/268b466f-3601-4873-853a-9bf3afc3410e/#ideas/recent'
                    rel='noreferrer'
                >
                    <img
                        style={{width: 21, height: 21, marginTop: 2}}
                        src={imagePath}
                        alt='User Feedback'
                    />
                </a>
            </OverlayTrigger>
            <StatusDropdown/>
        </RightControlsContainer>
    );
};

export default RightControls;
