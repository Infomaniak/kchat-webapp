// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

import './tip.scss';

export const KmeetTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.KmeetTourTip.title'
            defaultMessage='Kmeet'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.KmeetTourTip.content'
            defaultMessage='Create a kMeet call with a colleague by personal message or directly in a public channel to include all members'
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['channel-header-kmeet-btn'], [], {x: 5, y: 0, width: 0, height: 0});

    return (
        <span className='tip__positioned-verticaly'>
            <OnboardingTourTip
                title={title}
                screen={screen}
                placement='left-start'
                pulsatingDotPlacement='top'
                width={400}
                overlayPunchOut={overlayPunchOut}
            />
        </span>
    );
};
