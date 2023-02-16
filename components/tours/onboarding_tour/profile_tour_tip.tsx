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
            defaultMessage={'Profile'}
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.ProfileTourTip.content'
            defaultMessage={'Profile'}
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['accountSettings'], []);

    return (
        <OnboardingTourTip
            title={title}
            screen={screen}
            placement='left-start'
            width={400}
            overlayPunchOut={overlayPunchOut}
        />
    );
};
