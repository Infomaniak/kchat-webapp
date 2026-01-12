// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {matchPath, useLocation} from 'react-router-dom';

import type {ChannelCategory} from '@mattermost/types/channel_categories';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentTeamDefaultChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import {trackEvent as trackEventAction} from 'actions/telemetry_actions';
import {collapseAllCategoriesExcept} from 'actions/views/channel_sidebar';
import {open as openLhs} from 'actions/views/lhs';
import {
    openInvitationsModal,
    setShowOnboardingCompleteProfileTour,
    setShowOnboardingVisitConsoleTour,
    switchToChannels,
} from 'actions/views/onboarding_tasks';
import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {getOnboardingTaskPreferences} from 'selectors/onboarding';

import Gears from 'components/common/svg_images_components/gears_svg';
import Handshake from 'components/common/svg_images_components/handshake_svg';
import Security from 'components/common/svg_images_components/security_svg';
import Sunglasses from 'components/common/svg_images_components/sunglasses_svg';
import {openMenu} from 'components/menu';
import {
    AutoTourStatus,
    FINISHED,
    OnboardingTourSteps,
    OnboardingTourStepsForGuestUsers,
    TTNameMapToATStatusKey,
    TutorialTourName,
} from 'components/tours';
import {ELEMENT_ID_FOR_USER_ACCOUNT_MENU_BUTTON} from 'components/user_account_menu/user_account_menu';

import type {GlobalState} from 'types/store';

import {OnboardingTaskCategory, OnboardingTaskList, OnboardingTasksName, TaskNameMapToSteps} from './constants';
import {generateTelemetryTag} from './utils';

const useGetTaskDetails = () => {
    const {formatMessage} = useIntl();
    return {
        [OnboardingTasksName.CHANNELS_TOUR]: {
            id: 'task_learn_more_about_messaging',
            message: formatMessage({
                id: 'onboardingTask.taskList.introduction',
                defaultMessage: 'Take a tour of Channels.',
            }),
        },
        [OnboardingTasksName.INVITE_PEOPLE]: {
            id: 'task_invite_team_members',
            svg: Handshake,
            message: formatMessage({
                id: 'onboardingTask.checklist.task_invite_team_members',
                defaultMessage: 'Invite team members to the workspace.',
            }),
        },
        [OnboardingTasksName.COMPLETE_YOUR_PROFILE]: {
            id: 'task_complete_your_profile',
            svg: Sunglasses,
            message: formatMessage({
                id: 'onboardingTask.checklist.task_complete_your_profile',
                defaultMessage: 'Complete your profile.',
            }),
        },

        [OnboardingTasksName.DOWNLOAD_APP]: {
            id: 'task_download_mm_apps',
            message: formatMessage({
                id: 'onboardingTask.taskList.download',
                defaultMessage: 'Download the Desktop and Mobile Apps.',
            }),
        },

        [OnboardingTasksName.VISIT_SYSTEM_CONSOLE]: {
            id: 'task_visit_system_console',
            svg: Gears,
            message: formatMessage({
                id: 'onboardingTask.checklist.task_visit_system_console',
                defaultMessage: 'Visit the System Console to configure your workspace.',
            }),
        },
        [OnboardingTasksName.START_TRIAL]: {
            id: 'task_start_enterprise_trial',
            svg: Security,
            message: formatMessage({
                id: 'onboardingTask.checklist.task_start_enterprise_trial',
                defaultMessage: 'Learn more about Enterprise-level high-security features.',
            }),
        },
    };
};

export const useTasksList = () => {
    const list: Record<string, string> = {...OnboardingTasksName};

    delete list.PLAYBOOKS_TOUR;
    delete list.START_TRIAL;

    delete list.INVITE_PEOPLE;

    delete list.COMPLETE_YOUR_PROFILE;
    delete list.VISIT_SYSTEM_CONSOLE;

    return Object.values(list);
};

export const useTasksListWithStatus = () => {
    const dataInDb = useSelector(getOnboardingTaskPreferences);
    const tasksList = useTasksList();
    const getTaskDetails = useGetTaskDetails();
    return useMemo(() =>
        tasksList.map((task) => {
            const status = dataInDb.find((pref) => pref.name === task)?.value;
            return {
                name: task,
                status: status === FINISHED.toString(),
                label: () => {
                    const {id, svg, message} = getTaskDetails[task];
                    return (
                        <div key={id}>
                            {svg && <picture>
                                {React.createElement(svg, {width: 24, height: 24})}
                            </picture>}
                            <span>{message}</span>
                        </div>
                    );
                },
            };
        }), [dataInDb, tasksList]);
};

export const useHandleOnBoardingTaskData = () => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const storeSavePreferences = useCallback(
        (taskCategory: string, taskName, step: number) => {
            const preferences = [
                {
                    user_id: currentUserId,
                    category: taskCategory,
                    name: taskName,
                    value: step.toString(),
                },
            ];
            dispatch(savePreferences(currentUserId, preferences));
        },
        [currentUserId],
    );

    return useCallback((
        taskName: string,
        step: number,
        trackEvent = true,
        trackEventSuffix?: string,
        taskCategory = OnboardingTaskCategory,
    ) => {
        storeSavePreferences(taskCategory, taskName, step);
        if (trackEvent) {
            const eventSuffix = trackEventSuffix ? `${step}--${trackEventSuffix}` : step.toString();
            const telemetryTag = generateTelemetryTag(OnboardingTaskCategory, taskName, eventSuffix);
            trackEventAction(OnboardingTaskCategory, telemetryTag);
        }
    }, [storeSavePreferences]);
};

export const useHandleOnBoardingTaskTrigger = () => {
    const dispatch = useDispatch();
    const {pathname} = useLocation();

    const handleSaveData = useHandleOnBoardingTaskData();
    const currentUserId = useSelector(getCurrentUserId);
    const currentTeamDefaultChannelId = useSelector(getCurrentTeamDefaultChannelId);
    const isGuestUser = useSelector((state: GlobalState) => isCurrentUserGuestUser(state));
    const inAdminConsole = matchPath(pathname, {path: '/admin_console'}) != null;
    const inChannels = matchPath(pathname, {path: '/:team/channels/:chanelId'}) != null;

    return (taskName: string) => {
        switch (taskName) {
        case OnboardingTasksName.CHANNELS_TOUR: {
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            const tourCategory = isGuestUser ? TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS : TutorialTourName.ONBOARDING_TUTORIAL_STEP;
            const preferences = [
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: currentUserId,

                    // use SEND_MESSAGE when user is guest (channel creation and invitation are restricted), so only message box and the configure tips are shown
                    value: isGuestUser ? OnboardingTourStepsForGuestUsers.SEND_MESSAGE.toString() : OnboardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES.toString(),
                },
                {
                    user_id: currentUserId,
                    category: tourCategory,
                    name: TTNameMapToATStatusKey[tourCategory],
                    value: AutoTourStatus.ENABLED.toString(),
                },
            ];
            dispatch(savePreferences(currentUserId, preferences));
            if (!inChannels) {
                dispatch(switchToChannels());
            }
            dispatch(openLhs());
            dispatch(collapseAllCategoriesExcept((category: ChannelCategory) => !category.channel_ids.includes(currentTeamDefaultChannelId)));
            break;
        }
        case OnboardingTasksName.COMPLETE_YOUR_PROFILE: {
            openMenu(ELEMENT_ID_FOR_USER_ACCOUNT_MENU_BUTTON);
            dispatch(setShowOnboardingCompleteProfileTour(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            if (inAdminConsole) {
                dispatch(switchToChannels());
            }
            break;
        }
        case OnboardingTasksName.VISIT_SYSTEM_CONSOLE: {
            dispatch(setProductMenuSwitcherOpen(true));
            dispatch(setShowOnboardingVisitConsoleTour(true));
            handleSaveData(taskName, TaskNameMapToSteps[taskName].STARTED, true);
            break;
        }
        case OnboardingTasksName.INVITE_PEOPLE: {
            localStorage.setItem(OnboardingTaskCategory, 'true');

            if (inAdminConsole) {
                dispatch(openInvitationsModal(1000));
            } else {
                dispatch(openInvitationsModal());
            }
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            break;
        }
        case OnboardingTasksName.DOWNLOAD_APP: {
            handleSaveData(taskName, TaskNameMapToSteps[taskName].FINISHED, true);
            const preferences = [{
                user_id: currentUserId,
                category: OnboardingTaskCategory,
                name: OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN,
                value: 'true',
            }];
            dispatch(savePreferences(currentUserId, preferences));
            window.open('https://infomaniak.com/gtl/apps.kchat', '_blank', 'noopener,noreferrer');
            break;
        }
        default:
        }
    };
};

