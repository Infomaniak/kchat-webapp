// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

export const ProfileTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.ProfileTourTip.title'
            defaultMessage='Profile'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.ProfileTourTip.content'
            defaultMessage='Access your profile in one click and manage the settings of your Infomaniak account at any time'
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['accountSettings'], []);

    return (
        <span className='tip__positioned'>
            <OnboardingTourTip
                title={title}
                screen={screen}
                placement='left-start'
                pulsatingDotPlacement='bottom'
                width={400}
                overlayPunchOut={overlayPunchOut}
            />
        </span>
    );
};
