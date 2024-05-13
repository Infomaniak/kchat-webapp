// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback, useEffect, useRef} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import type {RouterProps} from 'react-router-dom';

import type {Team} from '@mattermost/types/teams';

import {GeneralTypes} from 'mattermost-redux/action_types';
import {getFirstAdminSetupComplete as getFirstAdminSetupCompleteAction} from 'mattermost-redux/actions/general';
import {Client4} from 'mattermost-redux/client';
import {General} from 'mattermost-redux/constants';
import {getFirstAdminSetupComplete, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getIsOnboardingFlowEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam, getMyKSuites} from 'mattermost-redux/selectors/entities/teams';
import {isFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import type {ActionResult} from 'mattermost-redux/types/actions';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';

import LogoSvg from 'components/common/svg_images_components/logo_dark_blue_svg';

import Constants from 'utils/constants';

import LaunchingWorkspace, {START_TRANSITIONING_OUT} from './launching_workspace';
import Progress from './progress';
import {
    WizardSteps,
    Animations,
    emptyForm,
    mapStepToPageView,
    mapStepToSubmitFail,
    PLUGIN_NAME_TO_ID_MAP,
    mapStepToPrevious,
} from './steps';
import type {
    WizardStep,
    AnimationReason,
    Form} from './steps';

import './preparing_workspace.scss';

const SubmissionStates = {
    Presubmit: 'Presubmit',
    UserRequested: 'UserRequested',
    Submitting: 'Submitting',
    SubmitFail: 'SubmitFail',
} as const;

type SubmissionState = typeof SubmissionStates[keyof typeof SubmissionStates];

// We want an apparent total wait of at least two seconds
// START_TRANSITIONING_OUT is how long the other side of the transitioning screen
const WAIT_FOR_REDIRECT_TIME = 2000 - START_TRANSITIONING_OUT;

export type Actions = {
    createTeam: (team: Team) => Promise<ActionResult>;
    updateTeam: (team: Team) => Promise<ActionResult>;
    checkIfTeamExists: (teamName: string) => Promise<ActionResult<boolean>>;
    getProfiles: (page: number, perPage: number, options: Record<string, any>) => Promise<ActionResult>;
}

type Props = RouterProps & {
    background?: JSX.Element | string;
    actions: Actions;
}

function makeOnPageView(step: WizardStep) {
    return function onPageViewInner() {
        pageVisited('first_admin_setup', mapStepToPageView(step));
    };
}

function makeSubmitFail(step: WizardStep) {
    return function onPageViewInner() {
        trackEvent('first_admin_setup', mapStepToSubmitFail(step));
    };
}

const trackSubmitFail = {
    [WizardSteps.Organization]: makeSubmitFail(WizardSteps.Organization),
    [WizardSteps.Plugins]: makeSubmitFail(WizardSteps.Plugins),
    [WizardSteps.InviteMembers]: makeSubmitFail(WizardSteps.InviteMembers),
    [WizardSteps.LaunchingWorkspace]: makeSubmitFail(WizardSteps.LaunchingWorkspace),
};

const onPageViews = {
    [WizardSteps.Organization]: makeOnPageView(WizardSteps.Organization),
    [WizardSteps.Plugins]: makeOnPageView(WizardSteps.Plugins),
    [WizardSteps.InviteMembers]: makeOnPageView(WizardSteps.InviteMembers),
    [WizardSteps.LaunchingWorkspace]: makeOnPageView(WizardSteps.LaunchingWorkspace),
};

const PreparingWorkspace = ({
    actions,
    history,
    background,
}: Props) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const genericSubmitError = intl.formatMessage({
        id: 'onboarding_wizard.submit_error.generic',
        defaultMessage: 'Something went wrong. Please try again.',
    });
    const isUserFirstAdmin = useSelector(isFirstAdmin);
    const onboardingFlowEnabled = useSelector(getIsOnboardingFlowEnabled);

    const currentTeam = useSelector(getCurrentTeam);
    const myTeams = useSelector(getMyKSuites);

    // In cloud instances created from portal,
    // new admin user has a team in myTeams but not in currentTeam.
    const team = currentTeam || myTeams?.[0];

    const config = useSelector(getConfig);
    const pluginsEnabled = config.PluginsEnabled === 'true';
    const showOnMountTimeout = useRef<NodeJS.Timeout>();

    const stepOrder = [
        pluginsEnabled && WizardSteps.Plugins,
        WizardSteps.LaunchingWorkspace,
    ].filter((x) => Boolean(x)) as WizardStep[];

    // first steporder that is not false
    const firstShowablePage = stepOrder[0];

    const firstAdminSetupComplete = useSelector(getFirstAdminSetupComplete);

    const [[mostRecentStep, currentStep], setStepHistory] = useState<[WizardStep, WizardStep]>([stepOrder[0], stepOrder[0]]);
    const [submissionState, setSubmissionState] = useState<SubmissionState>(SubmissionStates.Presubmit);
    const [form, setForm] = useState({
        ...emptyForm,
    });

    useEffect(() => {
        if (!pluginsEnabled) {
            if (!form.plugins.skipped) {
                setForm({
                    ...form,
                    plugins: {
                        skipped: false,
                    },
                });
            }
            if (currentStep === WizardSteps.Plugins) {
                const mostRecentStepIndex = stepOrder.indexOf(mostRecentStep);
                setStepHistory([mostRecentStep, stepOrder[Math.max(mostRecentStepIndex - 1, 0)]]);
            }
        }
    }, [pluginsEnabled, currentStep, mostRecentStep]);

    const [showFirstPage, setShowFirstPage] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        showOnMountTimeout.current = setTimeout(() => setShowFirstPage(true), 40);
        actions.getProfiles(0, General.PROFILE_CHUNK_SIZE, {roles: General.SYSTEM_ADMIN_ROLE});
        dispatch(getFirstAdminSetupCompleteAction());
        document.body.classList.add('admin-onboarding');
        return () => {
            document.body.classList.remove('admin-onboarding');
            if (showOnMountTimeout.current) {
                clearTimeout(showOnMountTimeout.current);
            }
        };
    }, []);

    const shouldShowPage = (step: WizardStep) => {
        if (currentStep !== step) {
            return false;
        }
        const isFirstPage = stepOrder.indexOf(step) === 0;
        if (isFirstPage) {
            return showFirstPage;
        }
        return true;
    };

    const redirectWithError = useCallback((redirectTo: WizardStep, error: string) => {
        setStepHistory([WizardSteps.LaunchingWorkspace, redirectTo]);
        setSubmissionState(SubmissionStates.SubmitFail);
        setSubmitError(error);
        trackSubmitFail[redirectTo]();
    }, []);

    // const createTeam = async (OrganizationName: string): Promise<{error: string | null; newTeam: Team | undefined | null}> => {
    //     const data = await actions.createTeam(makeNewTeam(OrganizationName, teamNameToUrl(OrganizationName || '').url));
    //     if (data.error) {
    //         return {error: genericSubmitError, newTeam: null};
    //     }
    //     return {error: null, newTeam: data.data};
    // };

    // const updateTeam = async (teamToUpdate: Team): Promise<{error: string | null; updatedTeam: Team | null}> => {
    //     const data = await actions.updateTeam(teamToUpdate);
    //     if (data.error) {
    //         return {error: genericSubmitError, updatedTeam: null};
    //     }
    //     return {error: null, updatedTeam: data.data};
    // };

    const sendForm = async () => {
        const sendFormStart = Date.now();
        setSubmissionState(SubmissionStates.Submitting);

        // send plugins
        const {skipped: skippedPlugins, ...pluginChoices} = form.plugins;
        let pluginsToSetup: string[] = [];
        if (!skippedPlugins) {
            pluginsToSetup = Object.entries(pluginChoices).reduce(
                (acc: string[], [k, v]): string[] => (v ? [...acc, PLUGIN_NAME_TO_ID_MAP[k as keyof Omit<Form['plugins'], 'skipped'>]] : acc), [],
            );
        }

        // This endpoint sets setup complete state, so we need to make this request
        // even if admin skipped submitting plugins.
        const completeSetupRequest = {
            organization: form.organization,
            install_plugins: pluginsToSetup,
        };

        try {
            await Client4.completeSetup(completeSetupRequest);
            dispatch({type: GeneralTypes.FIRST_ADMIN_COMPLETE_SETUP_RECEIVED, data: true});
        } catch (e) {
            redirectWithError(WizardSteps.Plugins, genericSubmitError);
            return;
        }

        const goToChannels = () => {
            dispatch({type: GeneralTypes.SHOW_LAUNCHING_WORKSPACE, open: true});
            history.push(`/${team.name}/channels/${Constants.DEFAULT_CHANNEL}`);
            trackEvent('first_admin_setup', 'admin_setup_complete');
        };

        const sendFormEnd = Date.now();
        const timeToWait = WAIT_FOR_REDIRECT_TIME - (sendFormEnd - sendFormStart);

        if (timeToWait > 0) {
            setTimeout(goToChannels, timeToWait);
        } else {
            goToChannels();
        }
    };

    useEffect(() => {
        if (submissionState !== SubmissionStates.UserRequested) {
            return;
        }
        sendForm();
    }, [submissionState]);

    const adminRevisitedPage = firstAdminSetupComplete && submissionState === SubmissionStates.Presubmit;
    const shouldRedirect = !isUserFirstAdmin || adminRevisitedPage || !onboardingFlowEnabled;

    useEffect(() => {
        if (shouldRedirect) {
            history.push('/');
        }
    }, [shouldRedirect]);

    const getTransitionDirection = (step: WizardStep): AnimationReason => {
        const stepIndex = stepOrder.indexOf(step);
        const currentStepIndex = stepOrder.indexOf(currentStep);
        const mostRecentStepIndex = stepOrder.indexOf(mostRecentStep);
        if (stepIndex === -1 || currentStepIndex === -1 || mostRecentStepIndex === -1) {
            return Animations.Reasons.EnterFromBefore;
        }
        if (currentStep === step) {
            return currentStepIndex >= mostRecentStepIndex ? Animations.Reasons.EnterFromBefore : Animations.Reasons.EnterFromAfter;
        }
        return stepIndex > currentStepIndex ? Animations.Reasons.ExitToBefore : Animations.Reasons.ExitToAfter;
    };

    const goPrevious = useCallback((e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && (e as React.KeyboardEvent).key) {
            const key = (e as React.KeyboardEvent).key;
            if (key !== Constants.KeyCodes.ENTER[0] && key !== Constants.KeyCodes.SPACE[0]) {
                return;
            }
        }
        if (submissionState !== SubmissionStates.Presubmit && submissionState !== SubmissionStates.SubmitFail) {
            return;
        }
        const stepIndex = stepOrder.indexOf(currentStep);
        if (stepIndex <= 0) {
            return;
        }
        trackEvent('first_admin_setup', mapStepToPrevious(currentStep));
        setStepHistory([currentStep, stepOrder[stepIndex - 1]]);
    }, [currentStep]);

    const skipTeamMembers = useCallback((skipped: boolean) => {
        if (skipped === form.teamMembers.skipped) {
            return;
        }
        setForm({
            ...form,
            teamMembers: {
                ...form.teamMembers,
                skipped,
            },
        });
    }, [form]);

    let previous: React.ReactNode = (
        <div
            onClick={goPrevious}
            onKeyUp={goPrevious}
            tabIndex={0}
            className='PreparingWorkspace__previous'
        >
            <i className='icon-chevron-up'/>
            <FormattedMessage
                id={'onboarding_wizard.previous'}
                defaultMessage='Previous'
            />
        </div>
    );
    if (currentStep === firstShowablePage) {
        previous = null;
    }

    return (
        <div className='PreparingWorkspace PreparingWorkspaceContainer'>
            {submissionState === SubmissionStates.SubmitFail && submitError && (
                <div className='PreparingWorkspace__submit-error'>
                    <i className='icon icon-alert-outline'/>
                    <span className='PreparingWorkspace__submit-error-message'>{submitError}</span>
                    <i
                        className='icon icon-close'
                        onClick={() => setSubmitError(null)}
                    />
                </div>
            )}
            {background}
            <div className='PreparingWorkspace__logo'>
                <LogoSvg/>
            </div>
            <Progress
                step={currentStep}
                stepOrder={stepOrder}
                transitionSpeed={Animations.PAGE_SLIDE}
            />
            <div className='PreparingWorkspacePageContainer'>
                <LaunchingWorkspace
                    onPageView={onPageViews[WizardSteps.LaunchingWorkspace]}
                    show={currentStep === WizardSteps.LaunchingWorkspace}
                    transitionDirection={getTransitionDirection(WizardSteps.LaunchingWorkspace)}
                />
            </div>
        </div>
    );
};

export default PreparingWorkspace;
