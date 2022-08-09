// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

/* eslint-disable max-lines */

import React, {useEffect, useRef} from 'react';

// import {useIntl} from 'react-intl';

// import {useDispatch, useSelector} from 'react-redux';
import {useSelector} from 'react-redux';

import {useHistory, useLocation} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions';
import {redirectUserToDefaultTeam} from 'actions/global_actions';
import LoadingIk from 'components/loading_ik';
import LoadingScreen from 'components/loading_screen';

import {Client4} from 'mattermost-redux/client';
import {RequestStatus} from 'mattermost-redux/constants';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';
import {getMyTeamMember, getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import LocalStorageStore from 'stores/local_storage_store';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';
import {IKConstants} from 'utils/constants-ik';
import {isDesktopApp} from 'utils/user_agent';
import {setCSRFFromCookie} from 'utils/utils';

import './login.scss';
import {Team} from '@mattermost/types/teams';

import {checkIKTokenIsExpired, clearLocalStorageToken, getChallengeAndRedirectToLogin, refreshIKToken, storeTokenResponse} from './utils';

const Login = () => {
    // const {formatMessage} = useIntl();
    // const dispatch = useDispatch<DispatchFunc>();
    const history = useHistory();
    const {pathname, search, hash} = useLocation();

    const searchParam = new URLSearchParams(search);
    const extraParam = searchParam.get('extra');
    const emailParam = searchParam.get('email');

    const {
        ExperimentalPrimaryTeam,
    } = useSelector(getConfig);
    const initializing = useSelector((state: GlobalState) => state.requests.users.logout.status === RequestStatus.SUCCESS || !state.storage.initialized);
    const currentUser = useSelector(getCurrentUser);
    const experimentalPrimaryTeam = useSelector((state: GlobalState) => (ExperimentalPrimaryTeam ? getTeamByName(state, ExperimentalPrimaryTeam) : undefined));
    const experimentalPrimaryTeamMember = useSelector((state: GlobalState) => getMyTeamMember(state, experimentalPrimaryTeam?.id ?? ''));
    const useCaseOnboarding = useSelector(getUseCaseOnboarding);

    const passwordInput = useRef<HTMLInputElement>(null);
    const closeSessionExpiredNotification = useRef<() => void>();

    useEffect(() => {
        if (currentUser) {
            redirectUserToDefaultTeam();
            return;
        }

        if (isDesktopApp()) {
            const loginCode = (new URLSearchParams(search)).get('code');

            const token = localStorage.getItem('IKToken');
            const refreshToken = localStorage.getItem('IKRefreshToken');
            const tokenExpire = localStorage.getItem('IKTokenExpire');

            if (token && tokenExpire && !checkIKTokenIsExpired()) {
                Client4.setAuthHeader = true;
                Client4.setToken(token);
                Client4.setCSRF(token);
                LocalStorageStore.setWasLoggedIn(true);
                GlobalActions.redirectUserToDefaultTeam();
            }

            // If need to refresh the token
            if (tokenExpire && checkIKTokenIsExpired()) {
                refreshIKToken(true);
                return;
            }

            if (loginCode) {
                const challenge = JSON.parse(localStorage.getItem('challenge'));

                //    Get token
                Client4.getIKLoginToken(
                    loginCode,
                    challenge?.challenge,
                    challenge?.verifier,
                    `${IKConstants.LOGIN_URL}`,
                    `${IKConstants.CLIENT_ID}`,
                ).then((resp) => {
                    console.log('get token', resp);
                    storeTokenResponse(resp);
                    localStorage.removeItem('challenge');
                    LocalStorageStore.setWasLoggedIn(true);
                    finishSignin();
                }).catch((error) => {
                    console.log('catch error', error);
                    clearLocalStorageToken();
                    getChallengeAndRedirectToLogin();
                });
                return;
            }

            if (hash) {
                const hash2Obj = {};
                // eslint-disable-next-line array-callback-return
                hash.substring(1).split('&').map((hk) => {
                    const temp = hk.split('=');
                    hash2Obj[temp[0]] = temp[1];
                });
                storeTokenResponse(hash2Obj);
                LocalStorageStore.setWasLoggedIn(true);
                finishSignin();

                return;
            }

            if ((!token || !refreshToken || !tokenExpire) && !loginCode) {
                getChallengeAndRedirectToLogin();
            }
        }

        // Determine if the user was unexpectedly logged out.
        if (LocalStorageStore.getWasLoggedIn()) {
            if (extraParam === Constants.SIGNIN_CHANGE) {
                // Assume that if the user triggered a sign in change, it was intended to logout.
                // We can't preflight this, since in some flows it's the server that invalidates
                // our session after we use it to complete the sign in change.
                LocalStorageStore.setWasLoggedIn(false);
            } else {
                // Although the authority remains the local sessionExpired bit on the state, set this
                // extra field in the querystring to signal the desktop app.
                const newSearchParam = new URLSearchParams(search);
                newSearchParam.set('extra', Constants.SESSION_EXPIRED);
                history.replace(`${pathname}?${newSearchParam}`);
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            if (closeSessionExpiredNotification!.current) {
                closeSessionExpiredNotification.current();
                closeSessionExpiredNotification.current = undefined;
            }
        };
    }, []);

    if (initializing) {
        return (<LoadingIk/>);
    }

    const finishSignin = (team?: Team) => {
        const query = new URLSearchParams(search);
        const redirectTo = query.get('redirect_to');

        setCSRFFromCookie();

        // Record a successful login to local storage. If an unintentional logout occurs, e.g.
        // via session expiration, this bit won't get reset and we can notify the user as such.
        LocalStorageStore.setWasLoggedIn(true);
        if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
            history.push(redirectTo);
        } else if (team) {
            history.push(`/${team.name}`);
        } else if (experimentalPrimaryTeamMember.team_id) {
            // Only set experimental team if user is on that team
            history.push(`/${ExperimentalPrimaryTeam}`);
        } else if (useCaseOnboarding) {
            // need info about whether admin or not,
            // and whether admin has already completed
            // first time onboarding. Instead of fetching and orchestrating that here,
            // let the default root component handle it.
            history.push('/');
        } else {
            redirectUserToDefaultTeam();
        }
    };

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
