// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

import './tip.scss';

export const SettingsTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.SettingsTourTip.title'
            defaultMessage='Settings'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.SettingsTourTip.content'
            defaultMessage='Access all your kChat settings. Choose your theme, customize notifications and find all the keyboard shortcuts'
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['right-controls-settings'], []);

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
