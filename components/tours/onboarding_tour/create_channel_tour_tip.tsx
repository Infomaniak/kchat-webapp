// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

import './tip.scss';

export const CreateChannelsTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.CreateChannelsTourTip.title'
            defaultMessage='Create Channels'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.CreateChannelsTourTip.content'
            defaultMessage='Create new channels to discuss with your team.'
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['showNewChannel'], []);

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
