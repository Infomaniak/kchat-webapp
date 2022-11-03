// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import React, {useEffect, useRef} from 'react';

import {useSelector} from 'react-redux';

import * as GlobalActions from 'actions/global_actions';
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

import {checkIKTokenExpiresSoon, checkIKTokenIsExpired, clearLocalStorageToken, getChallengeAndRedirectToLogin, refreshIKToken, storeTokenResponse} from './utils';
import './login.scss';

const Login = () => {
    // TODO: can we clean this?
    // const {
    //     ExperimentalPrimaryTeam,
    // } = useSelector(getConfig);

    const initializing = useSelector((state: GlobalState) => state.requests.users.logout.status === RequestStatus.SUCCESS || !state.storage.initialized);
    const currentUser = useSelector(getCurrentUser);

    // TODO: can we clean this?
    // const experimentalPrimaryTeam = useSelector((state: GlobalState) => (ExperimentalPrimaryTeam ? getTeamByName(state, ExperimentalPrimaryTeam) : undefined));
    // const experimentalPrimaryTeamMember = useSelector((state: GlobalState) => getMyTeamMember(state, experimentalPrimaryTeam?.id ?? ''));
    // const useCaseOnboarding = useSelector(getUseCaseOnboarding);
    // const isCloud = useSelector(isCurrentLicenseCloud);
    // const graphQLEnabled = useSelector(isGraphQLEnabled);

    const closeSessionExpiredNotification = useRef<() => void>();
    const intervalId = useRef<NodeJS.Timer | undefined>();

    // Session guard
    useEffect(() => {
        console.log('[LOGIN] init login component');
        console.log('[LOGIN] get was logged in => ', LocalStorageStore.getWasLoggedIn());

        if (isDesktopApp()) {
            const token = localStorage.getItem('IKToken');
            const refreshToken = localStorage.getItem('IKTokenExpire');

            // 1. Check for desktop session end of life
            if (checkIKTokenIsExpired() || !token || !refreshToken) {
                console.log('[LOGIN DESKTOP] Session EOL: Redirect to infomaniak login');
                if (intervalId.current) {
                    clearInterval(intervalId.current);
                }
                clearLocalStorageToken();
                getChallengeAndRedirectToLogin();

                return;
            }

            // 2. Session is not dead, setup token keepalive:
            // - if token is ok and isn't expired,
            if (token && refreshToken && !checkIKTokenIsExpired()) {
                console.log('[LOGIN DESKTOP] Token is ok');

                // - set an interval to run every minute to check if token needs refresh.
                // eslint-disable-next-line consistent-return
                intervalId.current = setInterval(() => {
                    // - if expiring soon, refresh before we start hitting errors.
                    if (checkIKTokenExpiresSoon()) {
                        refreshIKToken(/*redirectToReam*/false);
                    }
                }, 1000 * 60); // one minute

                GlobalActions.redirectUserToDefaultTeam();

                // Return clean up function.
                // https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
                // ---
                // Responsible for destroying the interval when computer is put in sleep mode to
                // prevent it from triggering redirects and ending up on the chrome-error page.
                // ---
                // eslint-disable-next-line consistent-return
                return () => clearInterval(intervalId.current as NodeJS.Timer);
            }
        }

        // For web simply send through to router if user exists.
        if (currentUser) {
            console.log('[LOGIN] Current user is ok');
            redirectUserToDefaultTeam();
        }
    }, []);

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
