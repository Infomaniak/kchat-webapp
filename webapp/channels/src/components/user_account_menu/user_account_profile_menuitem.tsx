// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AccountOutlineIcon} from '@infomaniak/compass-icons/components';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import * as Menu from 'components/menu';
import {OnboardingTaskCategory, OnboardingTasksName, TaskNameMapToSteps, CompleteYourProfileTour} from 'components/onboarding_tasks';

import {IKConstants} from 'utils/constants-ik';

import type {GlobalState} from 'types/store';

interface Props {
    userId: UserProfile['id'];
}

export default function UserAccountProfileMenuItem(props: Props) {
    const dispatch = useDispatch();

    const onboardingTaskStep = useSelector((state: GlobalState) => getInt(state, OnboardingTaskCategory, OnboardingTasksName.COMPLETE_YOUR_PROFILE, 0));
    const isCompleteYourProfileTaskPending = onboardingTaskStep === TaskNameMapToSteps[OnboardingTasksName.COMPLETE_YOUR_PROFILE].STARTED;

    //IK: Redirect to manager profile
    function handleClick() {
        window.open(new URL('/v3/ng/profile/user/dashboard', IKConstants.MANAGER_URL).toString(), '_blank');
    }

    function handleTourClick() {
        const taskName = OnboardingTasksName.COMPLETE_YOUR_PROFILE;
        const steps = TaskNameMapToSteps[taskName];

        dispatch(savePreferences(props.userId, [{
            user_id: props.userId,
            category: OnboardingTaskCategory,
            name: taskName,
            value: steps.FINISHED.toString(),
        }]));
    }

    return (
        <Menu.Item
            leadingElement={
                <AccountOutlineIcon
                    size={18}
                    aria-hidden='true'
                />
            }
            labels={
                <FormattedMessage
                    id='userAccountMenu.profileMenuItem.label'
                    defaultMessage='Profile'
                />
            }
            trailingElements={isCompleteYourProfileTaskPending && (
                <div
                    onClick={handleTourClick}
                    className='userAccountMenu_profileMenuItem_tourWrapper'
                >
                    <CompleteYourProfileTour/>
                </div>
            )}
            aria-haspopup={true}
            onClick={handleClick}
        />
    );
}
