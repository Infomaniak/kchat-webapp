// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import React, {useEffect, useRef} from 'react';

import {useSelector} from 'react-redux';

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

import {checkIKTokenIsExpired, clearLocalStorageToken, getChallengeAndRedirectToLogin} from './utils';
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

    // Session guard

    // DEV NOTES
    // When client4 starts hitting 401/403 return codes we redirect back here.
    // At this point the token has already expired so it is either a computer wake up
    // or our interval couldn't successfuly refresh the token. Apparently we should still
    // be able to refresh if the token has expired but this doesn't seem to be the case atm.

    useEffect(() => {
        console.log('[components/login] init login component');
        console.log('[components/login] get was logged in => ', LocalStorageStore.getWasLoggedIn());

        if (isDesktopApp()) {
            const token = localStorage.getItem('IKToken');
            const refreshToken = localStorage.getItem('IKRefreshToken');

            // Check for desktop session end of life
            if (checkIKTokenIsExpired() || !token || !refreshToken) {
                console.log('[components/login] session EOL: redirecting to infomaniak login');

                // Login should be the only one responsible for clearing storage.
                // The only other case is if we can't renew the token with code in root.
                clearLocalStorageToken();
                getChallengeAndRedirectToLogin();

                return;
            }
        }

        // For web simply send through to router if user exists.
        if (currentUser) {
            console.log('[components/login] current user is ok');
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
