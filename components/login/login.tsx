// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import React, {useCallback, useEffect, useRef, useState} from 'react';

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

import {isDesktopApp} from 'utils/user_agent';

import {clearLocalStorageToken, getChallengeAndRedirectToLogin, refreshIKToken} from './utils';
import './login.scss';

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

    const [refreshFailCount, setRefreshFailCount] = useState(0);

    const tryRefreshTokenWithErrorCount = useCallback(() => {
        if (refreshFailCount < MAX_TOKEN_RETRIES) {
            refreshIKToken(false).then(() => {
                console.log('[components/login] desktop token refreshed'); // eslint-disable-line no-console
                redirectUserToDefaultTeam();
            }).catch((e: unknown) => {
                console.warn('[components/login] desktop token refresh error: ', e); // eslint-disable-line no-console
                setRefreshFailCount(refreshFailCount + 1);
                console.log('[components/login] token refresh error count updated: ', refreshFailCount);
                clearInterval(tokenInterval.current as NodeJS.Timer);
                tokenInterval.current = setInterval(() => tryRefreshTokenWithErrorCount, 2000);
            });
        } else {
            // We track this case in sentry with the goal of reducing to a minimum the number of occurences.
            // Losing our entire app context to auth a user is far from ideal.
            console.log(`[components/login] failed to refresh token in ${MAX_TOKEN_RETRIES} attempts`);
            Sentry.captureException(new Error('Failed to refresh token in 3 attempts'));
            clearLocalStorageToken();
            getChallengeAndRedirectToLogin();
        }
    }, [refreshFailCount]);

    // DESKTOP DEV NOTES
    // We should assume that the only reason we end up here on desktop is that the token is expired. Otherwise this route is skipped
    // and we are redirected directly to default team.
    // ----
    // Here are the relevant redirects to watch out for that can end up here:
    // 1. needs_team will redirect here when currentUser is undefined, which can happen after a 401 on /me
    // 2. root will technically redirect here as it's rendered first, which means root is
    // responsible for it's own session management. Since root launches our first requests the only ever time
    // root won't skip this route is if it's a fresh user. The first condition here makes sure to handle the fresh user case.
    // For all other cases, we want to try refreshing before sending to login.
    useEffect(() => {
        console.log('[components/login] init login component');
        console.log('[components/login] get was logged in => ', LocalStorageStore.getWasLoggedIn());

        if (isDesktopApp()) {
            const token = localStorage.getItem('IKToken');
            const refreshToken = localStorage.getItem('IKRefreshToken');

            // Check for desktop session end of life
            if (!token || !refreshToken) {
                // Login should be the only one responsible for clearing storage.
                // The only other case is if we can't renew the token with code in root.
                console.log('[components/login] session corrupt, clearing storage');
                clearLocalStorageToken();
                console.log('[components/login] redirecting to infomaniak login');
                Sentry.captureException(new Error('Redirected to external login on desktop'));
                getChallengeAndRedirectToLogin();

                return;
            }

            tryRefreshTokenWithErrorCount();
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
            setRefreshFailCount(0);
        };
    }, []); //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        return () => {
            if (closeSessionExpiredNotification!.current) {
                closeSessionExpiredNotification.current();
                closeSessionExpiredNotification.current = undefined;
            }

            // window.removeEventListener('resize', onWindowResize);
            // window.removeEventListener('focus', onWindowFocus);
        };
    }, []);

    if (initializing) {
        return (<LoadingIk/>);
    }

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

    const getContent = () => {
        return (<LoadingIk/>);
    };

    return (
        <div className='login-body'>
            <div className='login-body-content'>
                {getContent()}
            </div>
        </div>
    );
};

export default Login;
