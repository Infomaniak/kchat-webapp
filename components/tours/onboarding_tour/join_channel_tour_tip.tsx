// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

import './tip.scss';

export const JoinChannelsTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.JoinChannelsTourTip.title'
            defaultMessage='Join channels'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.JoinChannelsTourTip.content'
            defaultMessage='Browse available channels to see what your team is discussing. As you join channels, organize them into categories based on how you work.'
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['showMoreChannels'], []);

    return (
        <span className='tip__positioned-horizontaly'>
            <OnboardingTourTip
                title={title}
                screen={screen}
                placement='right-start'
                pulsatingDotPlacement='right'
                width={400}
                overlayPunchOut={overlayPunchOut}
            />
        </span>
    );
};
