// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

export const StatusTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.StatusTourTip.title'
            defaultMessage={'Status'}
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.StatusTourTip.content'
            defaultMessage={'Status'}
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['status-menu-online', 'status-menu-away', 'status-menu-dnd_menuitem', 'status-menu-offline'], []);

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
