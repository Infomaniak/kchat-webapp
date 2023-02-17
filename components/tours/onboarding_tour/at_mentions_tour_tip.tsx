// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

import './tip.scss';

export const AtMentionsTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.AtMentionsTourTip.title'
            defaultMessage='At Mentions'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.AtMentionsTourTip.content'
            defaultMessage='At Mentions'
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['right-controls-at-mentions'], []);

    return (
        <span className='tip__positioned'>
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
