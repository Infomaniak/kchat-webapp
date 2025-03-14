// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import IconButton from '@infomaniak/compass-components/components/icon-button';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import {getCurrentLocale} from 'selectors/i18n';

import FlagNext from 'components/flag_next';
import OverlayTrigger from 'components/overlay_trigger';
import StatusDropdown from 'components/status_dropdown';
import Tooltip from 'components/tooltip';
import {OnboardingTourSteps, OnboardingTourStepsForGuestUsers} from 'components/tours';
import {
    AtMentionsTour,
    CustomizeYourExperienceTour,
    SettingsTour,
    useShowOnboardingTutorialStep,
} from 'components/tours/onboarding_tour';
import WithTooltip from 'components/with_tooltip';

import Constants from 'utils/constants';
import {isDesktopApp as getIsDesktopApp} from 'utils/user_agent';

import imagePath from 'images/icons/messages-bubble-user-feedback.svg';

import type {GlobalState} from 'types/store';

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
    justify-content: flex-end;

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

const ButtonWrapper = styled.div`
    height: 100%;
`;

const NewsWrapper = styled.div`
    position: relative;
    display: none;
    --module-news-icon-bell-color: rgba(var(--center-channel-color-rgb),0.785);
`;

const ReportingToolsWrapper = styled.div`
    height: 46px;
    width: 42px;
    display: none;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`;

const tooltipUserReport = (
    <Tooltip id='userReport'>
        <FormattedMessage
            id='global_header.userReport'
            defaultMessage='Feedback'
        />
    </Tooltip>
);

const userReportHrefs: Record<string, string> = {
    en: 'https://feedback.userreport.com/6b7737f6-0cc1-410f-993f-be2ffbf73a05#ideas/popular',
    fr: 'https://feedback.userreport.com/d7b91e08-f79e-4eae-8a5d-f1527c33bd9b#ideas/popular',
    es: 'https://feedback.userreport.com/a9ae4ff9-2920-4c3c-bbb1-67e6ac1db26e#ideas/popular',
    it: 'https://feedback.userreport.com/066a68a7-e8f9-47a3-8099-18591dbdfd1f#ideas/popular',
    de: 'https://feedback.userreport.com/e68afd5f-31f2-4327-af79-fb0b665aee68#ideas/popular',
};

const RightControls = (): JSX.Element => {
    // guest validation to see which point the messaging tour tip starts
    const isGuestUser = useSelector((state: GlobalState) => isCurrentUserGuestUser(state));
    const tourStep = isGuestUser ? OnboardingTourStepsForGuestUsers.CUSTOMIZE_EXPERIENCE : OnboardingTourSteps.CUSTOMIZE_EXPERIENCE;
    const locale = useSelector(getCurrentLocale);
    const atMentionsTourStep = isGuestUser ? OnboardingTourStepsForGuestUsers.AT_MENTIONS : OnboardingTourSteps.AT_MENTIONS;
    const showAtMentionsTutorialStep = useShowOnboardingTutorialStep(atMentionsTourStep);
    const settingsTourStep = isGuestUser ? OnboardingTourStepsForGuestUsers.SETTINGS : OnboardingTourSteps.SETTINGS;
    const showSettingsTutorialStep = useShowOnboardingTutorialStep(settingsTourStep);
    const isDesktopApp = getIsDesktopApp();
    let userReportHref = 'https://feedback.userreport.com/6b7737f6-0cc1-410f-993f-be2ffbf73a05#ideas/popular';
    if (userReportHrefs[locale]) {
        userReportHref = userReportHrefs[locale];
    }

    const showCustomizeTip = useShowOnboardingTutorialStep(tourStep);

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
            <ReportingToolsWrapper className='wc-trigger-reporting-tools--flex'>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <module-reporting-tools-component size='26'/>
            </ReportingToolsWrapper>
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
                    href={userReportHref}
                    rel='noreferrer'
                >
                    <img
                        style={{width: 21, height: 21, marginTop: 2}}
                        src={imagePath}
                        alt='User Feedback'
                    />
                </a>
            </OverlayTrigger>
            <>
                <ButtonWrapper>
                    {showAtMentionsTutorialStep && <AtMentionsTour/>}
                    <AtMentionsButton/>
                </ButtonWrapper>
                <SavedPostsButton/>
                {showCustomizeTip && <CustomizeYourExperienceTour/>}
            </>
            {!isDesktopApp && (
                <NewsWrapper className='grey wc-trigger-news--flex'>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    <module-news-component/>
                </NewsWrapper>
            )}
            <ButtonWrapper>
                {showSettingsTutorialStep && <SettingsTour/>}
                <SettingsButton/>
            </ButtonWrapper>
            {!isDesktopApp && (
                <WithTooltip
                    id='rightControl__tooltip'
                    title={
                        <FormattedMessage
                            id='global_header.ikProduct'
                            defaultMessage='Your products'
                        />
                    }
                    placement='bottom'
                >
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
                </WithTooltip>
            )}
            <StatusDropdown/>
            <FlagNext/>
        </RightControlsContainer>
    );
};

export default RightControls;
