// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

export const SettingsTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.SettingsTourTip.title'
            defaultMessage={'Settings'}
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.SettingsTourTip.content'
            defaultMessage={'Settings'}
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['right-controls-settings'], []);

    return (
        <OnboardingTourTip
            title={title}
            screen={screen}
            placement='bottom-start'
            width={400}
            overlayPunchOut={overlayPunchOut}
        />
    );
};
