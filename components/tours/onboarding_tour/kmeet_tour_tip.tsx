// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {useMeasurePunchouts} from '@mattermost/components';

import OnboardingTourTip from './onboarding_tour_tip';

export const KmeetTourTip = () => {
    const title = (
        <FormattedMessage
            id='onboardingTour.KmeetTourTip.title'
            defaultMessage={'Kmeet'}
        />
    );
    const screen = (
        <>
            <p>
                <FormattedMessage
                    id='onboardingTour.KmeetTourTip.content'
                    defaultMessage={'Kmeet'}
                />
            </p>
        </>
    );

    const overlayPunchOut = useMeasurePunchouts(['channel-header-meet-btn'], [], {x: 5, y: 0, width: 0, height: 0});

    return (
        <OnboardingTourTip
            title={title}
            screen={screen}
            placement='bottom-end'
            pulsatingDotTranslate={{x: 0, y: 5}}
            width={400}
            overlayPunchOut={overlayPunchOut}
        />
    );
};
