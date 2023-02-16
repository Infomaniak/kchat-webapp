// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

export const ChannelHeaderTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.ChannelHeaderTourTip.title'
            defaultMessage={'Channel Header'}
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.ChannelHeaderTourTip.content'
            defaultMessage={'Channel Header'}
        />
    );

    const overlayPunchOut = useMeasurePunchouts(['channel-header'], []);

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
