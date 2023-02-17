// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import {CategoryTypes} from 'packages/mattermost-redux/src/constants/channel_categories';

import OnboardingTourTip from './onboarding_tour_tip';

export const ChannelsTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.ChannelsTourTip.title'
            defaultMessage='Access Channels'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.ChannelsTourTip.content'
            defaultMessage='Lists all your Public and Private Channels. Conversations can be seen by every member in the Channel, ideal to share informations !'
        />
    );

    const overlayPunchOut = useMeasurePunchouts([`sidebar-droppable-category-${CategoryTypes.CHANNELS}`], []);

    return (
        <OnboardingTourTip
            title={title}
            screen={screen}
            placement='right-start'
            pulsatingDotPlacement='right'
            width={352}
            overlayPunchOut={overlayPunchOut}
        />
    );
};
