// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import React, {useEffect, useRef} from 'react';

import {useSelector} from 'react-redux';

import * as Sentry from '@sentry/react';

import {redirectUserToDefaultTeam} from 'actions/global_actions';
import LoadingIk from 'components/loading_ik';

// import LoadingScreen from 'components/loading_screen';
import {RequestStatus} from 'mattermost-redux/constants';

// import {getConfig} from 'mattermost-redux/selectors/entities/general';
// import {getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';
// import {getMyTeamMember, getTeamByName} from 'mattermost-redux/selectors/entities/teams';
// import {setCSRFFromCookie} from 'utils/utils';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import LocalStorageStore from 'stores/local_storage_store';
import {GlobalState} from 'types/store';

import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';

import {clearLocalStorageToken, getChallengeAndRedirectToLogin, refreshIKToken, isDefaultAuthServer} from './utils';
import './login.scss';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {Client4} from 'mattermost-redux/client';

const MAX_TOKEN_RETRIES = 3;

const Login = () => {
    // TODO: can we clean this?
    // const {
    //     ExperimentalPrimaryTeam,
    // } = useSelector(getConfig);

    const initializing = useSelector((state: GlobalState) => state.requests.users.logout.status === RequestStatus.SUCCESS || !state.storage.initialized);
    const currentUser = useSelector(getCurrentUser);

    const tokenInterval = useRef<NodeJS.Timer>();

    // TODO: can we clean this?
    // const experimentalPrimaryTeam = useSelector((state: GlobalState) => (ExperimentalPrimaryTeam ? getTeamByName(state, ExperimentalPrimaryTeam) : undefined));
    // const experimentalPrimaryTeamMember = useSelector((state: GlobalState) => getMyTeamMember(state, experimentalPrimaryTeam?.id ?? ''));
    // const useCaseOnboarding = useSelector(getUseCaseOnboarding);
    // const isCloud = useSelector(isCurrentLicenseCloud);
    // const graphQLEnabled = useSelector(isGraphQLEnabled);

    const closeSessionExpiredNotification = useRef<() => void>();

    // Session guard

    const tryRefreshTokenWithErrorCount = (errorCount: number) => {
        console.log('[components/login] tryRefreshTokenWithErrorCount with error count: ', errorCount);

        // clear this right away so it doesn't retrigger while in promise land.
        clearInterval(tokenInterval.current as NodeJS.Timer);
        refreshIKToken(/*redirectToTeam**/true).catch(() => {
            if (errorCount < MAX_TOKEN_RETRIES) {
                console.log('[components/login] will retry refresh');
                tokenInterval.current = setInterval(() => tryRefreshTokenWithErrorCount(errorCount + 1), 2000); // 2 sec
            } else {
                // We track this case in sentry with the goal of reducing to a minimum the number of occurences.
                // Losing our entire app context to auth a user is far from ideal.
                console.log(`[components/login] failed to refresh token in ${MAX_TOKEN_RETRIES} attempts`);
                Sentry.captureException(new Error('Failed to refresh token in 3 attempts'));
                clearLocalStorageToken();
                if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.0.0')) {
                    window.authManager.resetToken();
                    if (isDefaultAuthServer()) {
                        getChallengeAndRedirectToLogin();
                    } else {
                        window.postMessage(
                            {
                                type: 'reset-teams',
                                message: {},
                            },
                            window.origin,
                        );
                    }
                } else {
                    getChallengeAndRedirectToLogin();
                }
            }
        });
    };

    // DESKTOP DEV NOTES
    // We should assume that the only reason we end up here on desktop is that the token is expired. Otherwise this route is skipped
    // and we are redirected directly to default team.
    // ----
    // Here are the relevant redirects to watch out for that can end up here:
    // 1. needs_team will redirect here when currentUser is undefined, which can happen after a 401 on /me
    // 2. root (components/root not the other one) will technically redirect here as it's rendered first, which means root is
    // responsible for it's own session management. Since root launches our first requests the only ever time
    // root won't skip this route is if it's a fresh user. The first condition here makes sure to handle the fresh user case.
    // For all other cases, we want to try refreshing before sending to login.
    useEffect(() => {
        console.log('[components/login] init login component');
        console.log('[components/login] get was logged in => ', LocalStorageStore.getWasLoggedIn());

        if (isDesktopApp()) {
            if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.0.0')) {
                window.authManager.tokenRequest().then((data: {
                    token: string;
                    refreshToken: string;
                    expiresAt: number;
                }) => {
                    if (!Object.keys(data).length) { // eslint-disable-line no-negated-condition
                        if (isDefaultAuthServer()) {
                            getChallengeAndRedirectToLogin();
                        } else {
                            window.postMessage(
                                {
                                    type: 'reset-teams',
                                    message: {},
                                },
                                window.origin,
                            );
                        }
                    } else {
                        localStorage.setItem('IKToken', data.token);
                        localStorage.setItem('IKRefreshToken', data.refreshToken);
                        localStorage.setItem('IKTokenExpire', (data.expiresAt).toString());

                        Client4.setToken(data.token);
                        Client4.setCSRF(data.token);
                        Client4.setAuthHeader = true;

                        redirectUserToDefaultTeam();
                    }

                    // if (!data) {
                    //     getChallengeAndRedirectToLogin();
                    // }
                });
            } else {
                const token = localStorage.getItem('IKToken');
                const refreshToken = localStorage.getItem('IKRefreshToken');

                // Check for desktop session end of life
                if (!token || !refreshToken) {
                    // Login should be the only one responsible for clearing storage.
                    // The only other case is if we can't renew the token with code in root.
                    console.log('[components/login] no session, clearing storage just in case');
                    clearLocalStorageToken();
                    console.log('[components/login] redirecting to infomaniak login');
                    Sentry.captureException(new Error('Redirected to external login on desktop'));
                    getChallengeAndRedirectToLogin();

                    return;
                }

                // This will try to refresh the token 3 times and will redirect to our ext
                // login service if none of the attempts succeed.
                tryRefreshTokenWithErrorCount(0);
            }
        } else if (currentUser) {
            // Web auth redirects are still triggered throught client4 so we
            // dont need to do any checks here.
            console.log('[components/login] current user is ok -> redirecting to team');
            redirectUserToDefaultTeam();
        }

        // We love hooks
        // eslint-disable-next-line consistent-return
        return () => {
            console.log('login effect cleanup');
            clearInterval(tokenInterval.current as NodeJS.Timer);
            if (closeSessionExpiredNotification!.current) {
                closeSessionExpiredNotification.current();
                closeSessionExpiredNotification.current = undefined;
            }

            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('focus', onWindowFocus);
        };
    }, []); //eslint-disable-line react-hooks/exhaustive-deps

    // const finishSignin = (team?: Team) => {
    //     const query = new URLSearchParams(search);
    //     const redirectTo = query.get('redirect_to');

    //     setCSRFFromCookie();

    //     // Record a successful login to local storage. If an unintentional logout occurs, e.g.
    //     // via session expiration, this bit won't get reset and we can notify the user as such.
    //     LocalStorageStore.setWasLoggedIn(true);
    //     if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
    //         history.push(redirectTo);
    //     } else if (team) {
    //         history.push(`/${team.name}`);
    //     } else if (experimentalPrimaryTeamMember.team_id) {
    //         // Only set experimental team if user is on that team
    //         history.push(`/${ExperimentalPrimaryTeam}`);
    //     } else if (useCaseOnboarding) {
    //         // need info about whether admin or not,
    //         // and whether admin has already completed
    //         // first time onboarding. Instead of fetching and orchestrating that here,
    //         // let the default root component handle it.
    //         history.push('/');
    //     } else {
    //         redirectUserToDefaultTeam();
    //     }
    // };

    return (
        <div className='login-body'>
            <div className='login-body-content'>
                <LoadingIk/>
            </div>
        </div>
    );
};

export default Login;
