// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import {ChannelsTourTip, ChannelsTourTipProps, TutorialTourName} from 'components/tours';

const OnboardingTourTip = (props: Omit<ChannelsTourTipProps, 'tourCategory'>) => {
    const isGuest = useSelector(isCurrentUserGuestUser);
    const tourCategory = isGuest ? TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS : TutorialTourName.ONBOARDING_TUTORIAL_STEP;
    return (
        <ChannelsTourTip
            {...props}
            tourCategory={tourCategory}
        />
    );
};

export default OnboardingTourTip;
