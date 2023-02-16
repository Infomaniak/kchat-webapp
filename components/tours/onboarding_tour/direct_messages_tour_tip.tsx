// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import {CategoryTypes} from 'packages/mattermost-redux/src/constants/channel_categories';

import OnboardingTourTip from './onboarding_tour_tip';

export const DirectMessagesTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.DirectMessagesTourTip.title'
            defaultMessage={'Direct messages'}
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.DirectMessagesTourTip.content'
            defaultMessage={'Direct Messages'}
        />
    );

    const overlayPunchOut = useMeasurePunchouts([`sidebar-droppable-category-${CategoryTypes.DIRECT_MESSAGES}`], []);

    return (
        <OnboardingTourTip
            title={title}
            screen={screen}
            placement='right-start'
            width={400}
            overlayPunchOut={overlayPunchOut}
        />
    );
};
