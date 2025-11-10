// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CheckCircleIcon, CheckIcon} from '@infomaniak/compass-icons/components';
import React, {useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {setStatus} from 'mattermost-redux/actions/users';
import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';
import {getShowTutorialStep} from 'selectors/onboarding';

import * as Menu from 'components/menu';
import {OnboardingTasksName} from 'components/onboarding_tasks';
import ResetStatusModal from 'components/reset_status_modal';
import {OnboardingTourSteps, OnboardingTourStepsForGuestUsers, TutorialTourName} from 'components/tours';
import {StatusTour} from 'components/tours/onboarding_tour';

import {UserStatuses, ModalIdentifiers} from 'utils/constants';

import type {GlobalState} from 'types/store';
interface Props {
    userId: UserProfile['id'];
    shouldConfirmBeforeStatusChange: boolean;
    isStatusOnline: boolean;
}

export default function UserAccountOnlineMenuItem(props: Props) {
    const dispatch = useDispatch();
    const isGuest = useSelector((state: GlobalState) => isCurrentUserGuestUser(state));
    const showStatusTutorialStep = useSelector((state: GlobalState) => getShowTutorialStep(state, {
        tourName: isGuest ? TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS : TutorialTourName.ONBOARDING_TUTORIAL_STEP,
        taskName: OnboardingTasksName.CHANNELS_TOUR,
        tourStep: isGuest ? OnboardingTourStepsForGuestUsers.STATUS : OnboardingTourSteps.STATUS,
    }));

    function handleClick() {
        if (props.shouldConfirmBeforeStatusChange) {
            dispatch(openModal({
                modalId: ModalIdentifiers.RESET_STATUS,
                dialogType: ResetStatusModal,
                dialogProps: {
                    newStatus: UserStatuses.ONLINE,
                },
            }));
        } else {
            dispatch(setStatus({
                user_id: props.userId,
                status: UserStatuses.ONLINE,
            }));
        }
    }

    const trailingElement = useMemo(() => {
        if (props.isStatusOnline) {
            return (
                <>
                    <div
                        className='userAccountMenu_profileMenuItem_tourWrapper'
                    >
                        {showStatusTutorialStep && <StatusTour/>}
                    </div>

                    <CheckIcon
                        size={16}
                        className='userAccountMenu_menuItemTrailingCheckIcon'
                        aria-hidden='true'
                    />
                </>
            );
        }

        return null;
    }, [props.isStatusOnline]);

    return (
        <Menu.Item
            leadingElement={
                <CheckCircleIcon
                    size='18'
                    className='userAccountMenu_onlineMenuItem_icon'
                    aria-hidden='true'
                />
            }
            labels={
                <FormattedMessage
                    id='userAccountMenu.onlineMenuItem.label'
                    defaultMessage='Online'
                />
            }
            trailingElements={trailingElement}
            aria-checked={props.isStatusOnline}
            onClick={handleClick}
        />
    );
}
