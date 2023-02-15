// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

export const SettingsTourTip = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.SettingsTourTip.title'
            defaultMessage={'Settings'}
        />
    );
    const screen = (
        <>
            <p>
                <FormattedMessage
                    id='onboardingTour.SettingsTourTip.content'
                    defaultMessage={'Settings'}
                />
            </p>
        </>
    );

    const overlayPunchOut = useMeasurePunchouts(['right-controls-settings'], []);

    return (
        <OnboardingTourTip
            title={title}
            screen={screen}
            placement='bottom-start'
            translate={{x: 70, y: 30}}
            width={400}
            overlayPunchOut={overlayPunchOut}
        />
    );
};
