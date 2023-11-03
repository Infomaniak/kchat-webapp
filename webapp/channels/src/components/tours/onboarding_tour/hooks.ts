// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {getCurrentUserId, isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import {TutorialTourName} from '../constant';

export const useShowOnboardingTutorialStep = (stepToShow: number): boolean => {
    const currentUserId = useSelector(getCurrentUserId);
    const isGuest = useSelector(isCurrentUserGuestUser);
    const tourName = isGuest ? TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS : TutorialTourName.ONBOARDING_TUTORIAL_STEP;
    const boundGetInt = (state: GlobalState) => getInt(state, tourName, currentUserId, 0);
    const step = useSelector<GlobalState, number>(boundGetInt);
    return step === stepToShow;
};
