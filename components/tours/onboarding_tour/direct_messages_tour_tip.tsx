// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import {CategoryTypes} from 'packages/mattermost-redux/src/constants/channel_categories';

import OnboardingTourTip from './onboarding_tour_tip';

import './tip.scss';

export const DirectMessagesTour = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.DirectMessagesTourTip.title'
            defaultMessage='Direct messages'
        />
    );
    const screen = (
        <FormattedMessage
            id='onboardingTour.DirectMessagesTourTip.content'
            defaultMessage='Contact a member of your organisation or create a private conversation with up to 7 users'
        />
    );

    const overlayPunchOut = useMeasurePunchouts([`sidebar-droppable-category-${CategoryTypes.DIRECT_MESSAGES}`], []);

    return (
        <span className='tip__positioned-horizontaly'>
            <OnboardingTourTip
                title={title}
                screen={screen}
                placement='right-start'
                pulsatingDotPlacement='right-start'
                width={400}
                overlayPunchOut={overlayPunchOut}
            />
        </span>
    );
};
