// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

import './tip.scss';

export const StatusTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.StatusTourTip.title'
            defaultMessage='Status'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.StatusTourTip.content'
            defaultMessage='In a meeting or on leave? Update your status to inform your colleagues whether you are available or not'
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['status-menu-online', 'status-menu-away', 'status-menu-dnd_menuitem', 'status-menu-offline'], []);

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
