// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

import './tip.scss';

export const ChannelHeaderTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.ChannelHeaderTourTip.title'
            defaultMessage='Channel Header'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.ChannelHeaderTourTip.content'
            defaultMessage='Pin messages, add links in your channel header and access all files shared with members present'
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['channel-header'], []);

    return (
        <span className='tip__positioned'>
            <OnboardingTourTip
                title={title}
                screen={screen}
                placement='bottom-start'
                pulsatingDotPlacement='top'
                width={400}
                overlayPunchOut={overlayPunchOut}
            />
        </span>
    );
};
