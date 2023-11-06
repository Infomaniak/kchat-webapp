// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {setStatus, unsetCustomStatus} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';
import {get, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getStatusForUserId, isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';
import {setStatusDropdown} from 'actions/views/status_dropdown';
import {getCurrentUserTimezone} from 'selectors/general';
import {getShowTutorialStep} from 'selectors/onboarding';
import {makeGetCustomStatus, isCustomStatusEnabled, showStatusDropdownPulsatingDot, isCustomStatusExpired} from 'selectors/views/custom_status';
import {isStatusDropdownOpen} from 'selectors/views/status_dropdown';

import {OnboardingTasksName} from 'components/onboarding_tasks';
import {OnboardingTourSteps, OnboardingTourStepsForGuestUsers, TutorialTourName} from 'components/tours';

import type {GlobalState} from 'types/store';

import StatusDropdown from './status_dropdown';

const STAFF_ONLY_TEAM_NAME_WHITELIST = [
    'infomaniak',
];

function makeMapStateToProps() {
    const getCustomStatus = makeGetCustomStatus();

    return function mapStateToProps(state: GlobalState) {
        const currentUser = getCurrentUser(state);

        const userId = currentUser?.id;
        const customStatus = getCustomStatus(state, userId);
        const isMilitaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false);
        const isGuest = isCurrentUserGuestUser(state);
        const showStatusTutorialStep = getShowTutorialStep(state, {
            tourName: isGuest ? TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS : TutorialTourName.ONBOARDING_TUTORIAL_STEP,
            taskName: OnboardingTasksName.CHANNELS_TOUR,
            tourStep: isGuest ? OnboardingTourStepsForGuestUsers.STATUS : OnboardingTourSteps.STATUS,
        });
        const showProfileTutorialStep = getShowTutorialStep(state, {
            tourName: isGuest ? TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS : TutorialTourName.ONBOARDING_TUTORIAL_STEP,
            taskName: OnboardingTasksName.CHANNELS_TOUR,
            tourStep: isGuest ? OnboardingTourStepsForGuestUsers.PROFILE : OnboardingTourSteps.PROFILE,
        });

        const currentTeam = getCurrentTeam(state);
        const showNextSwitch = currentTeam ? STAFF_ONLY_TEAM_NAME_WHITELIST.includes(currentTeam.name) : false;

        return {
            userId,
            profilePicture: Client4.getProfilePictureUrl(userId, currentUser?.last_picture_update),
            autoResetPref: get(state, Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, userId, ''),
            status: getStatusForUserId(state, userId),
            customStatus,
            currentUser,
            isCustomStatusEnabled: isCustomStatusEnabled(state),
            isCustomStatusExpired: isCustomStatusExpired(state, customStatus),
            isMilitaryTime,
            isStatusDropdownOpen: isStatusDropdownOpen(state),
            showCustomStatusPulsatingDot: showStatusDropdownPulsatingDot(state),
            showCompleteYourProfileTour: false,
            timezone: getCurrentUserTimezone(state),
            showStatusTutorialStep,
            showProfileTutorialStep,
            showNextSwitch,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            openModal,
            setStatus,
            unsetCustomStatus,
            setStatusDropdown,
            savePreferences,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(StatusDropdown);
