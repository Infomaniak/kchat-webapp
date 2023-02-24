// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled, {css} from 'styled-components';

import Icon from '@infomaniak/compass-components/foundations/icon/Icon';
import {FormattedMessage} from 'react-intl';

import {useFirstAdminUser, useIsCurrentUserSystemAdmin} from 'components/global_header/hooks';

import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';
import {getShowTaskListBool} from 'selectors/onboarding';
import {getBool, getMyPreferences as getMyPreferencesSelector} from 'mattermost-redux/selectors/entities/preferences';
import {getMyPreferences, savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {trackEvent} from 'actions/telemetry_actions';
import {
    useTasksListWithStatus,
    OnboardingTaskCategory,
    OnboardingTaskList,
} from 'components/onboarding_tasks';
import {useHandleOnBoardingTaskTrigger} from 'components/onboarding_tasks/onboarding_tasks_manager';
import {GlobalState} from 'types/store';

import {Preferences, RecommendedNextStepsLegacy} from 'utils/constants';

import {TaskListPopover} from './onboarding_tasklist_popover';
import {Task} from './onboarding_tasklist_task';
import Completed from './onboarding_tasklist_completed';
import {CompletedAnimation} from './onboarding_tasklist_animations';
import TasklistIcon from './tasklist_icon';

const TaskItems = styled.div`
    border-radius: 4px;
    border: solid 1px rgba(var(--center-channel-color-rgb), 0.16);
    background-color: var(--center-channel-bg);
    width: 400px;
    padding: 24px 0;
    transform: scale(0);
    opacity: 0;
    box-shadow: var(--elevation-6);
    transition: opacity 250ms ease-in-out 0ms, transform 250ms ease-in-out 0ms;
    transform-origin: left bottom;
    max-height: ${document.documentElement.clientHeight}px;
    overflow-y: auto;

    &.open {
        transform: scale(1);
        opacity: 1;
    }

    h1 {
        font-size: 20px;
        padding: 0 24px;
        margin: 0;
    }

    p {
        font-size: 12px;
        color: rgba(var(--center-channel-color-rgb), 0.72);
        padding: 4px 24px;
    }

    .link {
        font-size: 12px;
        color: var(--link-color);
        padding: 12px 24px 0;
        font-weight: bold;
        cursor: pointer;
        display: block;
        :hover{
          text-decoration: underline
        }
    }
`;

const Button = styled.button<{open: boolean}>(({open}) => {
    return css`
        width: 36px;
        height: 36px;
        padding: 7px;
        border-radius: 50%;
        left: 20px;
        bottom: 20px;
        position: fixed;
        z-index: 101;
        display: flex;
        align-items: center;
        background: var(--center-channel-bg);
        border: solid 1px rgba(var(--center-channel-color-rgb), 0.16);
        box-shadow: var(--elevation-3);

        i {
            color: rgba(var(--center-channel-color-rgb), 0.56);
        }

        &:hover {
            border-color: rgba(var(--center-channel-color-rgb), 0.24);
            box-shadow: var(--elevation-4);

            i {
                color: rgba(var(--center-channel-color-rgb), 0.72)
            }
        }

        span {
            width: 20px;
            height: 16px;
            background: var(--button-bg);
            position: fixed;
            display: ${open ? 'none' : 'block'};
            border-radius: 12px;
            color: var(--button-color);
            font-weight: bold;
            font-size: 11px;
            line-height: 16px;
            bottom: 47px;
            left: 41px;
        }
    `;
});

const Skeleton = styled.div`
    height: auto;
    padding: 0 20px;
    position: relative;
`;

const OnBoardingTaskList = (): JSX.Element | null => {
    const myPreferences = useSelector((state: GlobalState) => getMyPreferencesSelector(state));

    useEffect(() => {
        dispatch(getPrevTrialLicense());
        if (Object.keys(myPreferences).length === 0) {
            dispatch(getMyPreferences());
        }
    }, []);

    const open = useSelector(((state: GlobalState) => getBool(state, OnboardingTaskCategory, OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN)));
    const trigger = useRef<HTMLButtonElement>(null);
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const handleTaskTrigger = useHandleOnBoardingTaskTrigger();
    const tasksList = useTasksListWithStatus();
    const [completedCount, setCompletedCount] = useState(tasksList.filter((task) => task.status).length);
    const [showAnimation, setShowAnimation] = useState(false);
    const itemsLeft = tasksList.length - completedCount;
    const isCurrentUserSystemAdmin = useIsCurrentUserSystemAdmin();
    const isFirstAdmin = useFirstAdminUser();
    const isEnableOnboardingFlow = useSelector((state: GlobalState) => getConfig(state).EnableOnboardingFlow === 'true');
    const [showTaskList, firstTimeOnboarding] = useSelector(getShowTaskListBool);

    const startTask = (taskName: string) => {
        toggleTaskList();
        handleTaskTrigger(taskName);
    };

    const initOnboardingPrefs = async () => {
        // save to preferences the show/open-task-list to true
        // also save the recomendedNextSteps-hide to true to avoid asserting to true
        // the logic to firstTimeOnboarding
        await dispatch(savePreferences(currentUserId, [
            {
                category: OnboardingTaskCategory,
                user_id: currentUserId,
                name: OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW,
                value: 'true',
            },
            {
                user_id: currentUserId,
                category: OnboardingTaskCategory,
                name: OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN,
                value: 'true',
            },
            {
                user_id: currentUserId,
                category: Preferences.RECOMMENDED_NEXT_STEPS,
                name: RecommendedNextStepsLegacy.HIDE,
                value: 'true',
            },
        ]));
    };

    useEffect(() => {
        if (firstTimeOnboarding) {
            initOnboardingPrefs();
        }
    }, []);

    useEffect(() => {
        if (firstTimeOnboarding && showTaskList && isEnableOnboardingFlow) {
            trackEvent(OnboardingTaskCategory, OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW);
        }
    }, [firstTimeOnboarding, showTaskList, isEnableOnboardingFlow]);

    useEffect(() => {
        if (firstTimeOnboarding && showTaskList && isEnableOnboardingFlow) {
            trackEvent(OnboardingTaskCategory, OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW);
        }
    }, [firstTimeOnboarding, showTaskList, isEnableOnboardingFlow]);

    // Done to show task done animation in closed state as well
    useEffect(() => {
        const newCCount = tasksList.filter((task) => task.status).length;
        const show = localStorage.getItem(OnboardingTaskCategory);
        if (show || ((completedCount + 1) === newCCount && !open)) {
            setTimeout(() => {
                setShowAnimation(true);
                setCompletedCount(newCCount);
            }, 100);
            setTimeout(() => {
                setShowAnimation(false);
                setCompletedCount(newCCount);
            }, 500);
            localStorage.removeItem(OnboardingTaskCategory);
        } else {
            setCompletedCount(newCCount);
        }
    }, [tasksList, completedCount]);

    const dismissChecklist = useCallback(() => {
        const preferences = [{
            user_id: currentUserId,
            category: OnboardingTaskCategory,
            name: OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW,
            value: 'false',
        },
        {
            user_id: currentUserId,
            category: OnboardingTaskCategory,
            name: OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN,
            value: 'false',
        }];
        dispatch(savePreferences(currentUserId, preferences));
        trackEvent(OnboardingTaskCategory, OnboardingTaskList.DECLINED_ONBOARDING_TASK_LIST);
    }, [currentUserId]);

    const toggleTaskList = useCallback(() => {
        const preferences = [{
            user_id: currentUserId,
            category: OnboardingTaskCategory,
            name: OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN,
            value: String(!open),
        }];

        // disable onboarding if the user completed every steps
        if (open && completedCount === tasksList.length) {
            preferences.push({
                user_id: currentUserId,
                category: OnboardingTaskCategory,
                name: OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW,
                value: 'false',
            });
        }
        dispatch(savePreferences(currentUserId, preferences));
        trackEvent(OnboardingTaskCategory, open ? OnboardingTaskList.ONBOARDING_TASK_LIST_CLOSE : OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN);
    }, [open, currentUserId, completedCount, tasksList]);

    if (Object.keys(myPreferences).length === 0 || !showTaskList || !isEnableOnboardingFlow) {
        return null;
    }

    return (
        <>
            <CompletedAnimation completed={showAnimation}/>
            <Button
                onClick={toggleTaskList}
                ref={trigger}
                open={open}
                data-cy='onboarding-task-list-action-button'
            >
                <Icon glyph={open ? 'close' : 'playlist-check'}/>
                {itemsLeft !== 0 && (<span>{itemsLeft}</span>)}
            </Button>
            <TaskListPopover
                isVisible={open}
                trigger={trigger}
                onClick={toggleTaskList}
            >
                <TaskItems className={open ? 'open' : ''}>
                    {completedCount === tasksList.length ?
                        <Completed
                            dismissAction={dismissChecklist}
                            isFirstAdmin={isFirstAdmin}
                            isCurrentUserSystemAdmin={isCurrentUserSystemAdmin}
                        /> : (
                            <>
                                <h1>
                                    <FormattedMessage
                                        id='next_steps_view.welcomeToMattermost'
                                        defaultMessage='Welcome to KChat'
                                    />
                                </h1>
                                <p>
                                    <FormattedMessage
                                        id='onboardingTour.taskList.subtitle'
                                        defaultMessage="Let's get up and running."
                                    />
                                </p>
                                <Skeleton>
                                    <TasklistIcon/>
                                </Skeleton>
                                {tasksList.map((task) => (
                                    <Task
                                        key={OnboardingTaskCategory + task.name}
                                        label={task.label()}
                                        onClick={() => {
                                            startTask(task.name);
                                        }}
                                        completedStatus={task.status}
                                    />
                                ))}
                                <span
                                    className='link'
                                    onClick={dismissChecklist}
                                >
                                    <FormattedMessage
                                        id='onboardingTask.taskList.dismiss_link'
                                        defaultMessage='No thanks, I’ll figure it out myself'
                                    />
                                </span>
                            </>
                        )}
                </TaskItems>
            </TaskListPopover>
        </>
    );
};

export default OnBoardingTaskList;
