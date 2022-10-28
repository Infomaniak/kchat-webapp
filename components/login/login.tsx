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

// import LoadingScreen from 'components/loading_screen';
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
    const history = useHistory();
    const {search, hash} = useLocation();

    const {
        ExperimentalPrimaryTeam,
    } = useSelector(getConfig);
    const initializing = useSelector((state: GlobalState) => state.requests.users.logout.status === RequestStatus.SUCCESS || !state.storage.initialized);
    const currentUser = useSelector(getCurrentUser);
    const experimentalPrimaryTeam = useSelector((state: GlobalState) => (ExperimentalPrimaryTeam ? getTeamByName(state, ExperimentalPrimaryTeam) : undefined));
    const experimentalPrimaryTeamMember = useSelector((state: GlobalState) => getMyTeamMember(state, experimentalPrimaryTeam?.id ?? ''));
    const useCaseOnboarding = useSelector(getUseCaseOnboarding);

    // const isCloud = useSelector(isCurrentLicenseCloud);
    // const graphQLEnabled = useSelector(isGraphQLEnabled);

    // const passwordInput = useRef<HTMLInputElement>(null);

    const closeSessionExpiredNotification = useRef<() => void>();

    useEffect(() => {
        console.log('[LOGIN] init login component');
        console.log('[LOGIN] get was logged in => ', LocalStorageStore.getWasLoggedIn());

        if (currentUser) {
            console.log('[LOGIN] Current user is ok');
            redirectUserToDefaultTeam();
            return;
        }

        if (isDesktopApp()) {
            const loginCode = (new URLSearchParams(search)).get('code');
            if (loginCode) {
                console.log('[LOGIN] Login with code');
            }
            const token = localStorage.getItem('IKToken');

            if (token && localStorage.getItem('IKTokenExpire') && !checkIKTokenIsExpired()) {
                Client4.setAuthHeader = true;
                Client4.setToken(token);
                Client4.setCSRF(token);
                window.postMessage(
                    {
                        type: 'token-refreshed',
                        message: {
                            token,
                        },
                    },
                    window.origin,
                );

                LocalStorageStore.setWasLoggedIn(true);
                GlobalActions.redirectUserToDefaultTeam();
            }

            if (!token || !localStorage.getItem('IKRefreshToken') || !localStorage.getItem('IKTokenExpire')) {
                clearLocalStorageToken();
                getChallengeAndRedirectToLogin();

                return;
            }

            // If need to refresh the token
            if (localStorage.getItem('IKTokenExpire') && checkIKTokenIsExpired()) {
                refreshIKToken(true);
            }

            if (loginCode) {
                const challenge = JSON.parse(localStorage.getItem('challenge') as string);

                //    Get token
                Client4.getIKLoginToken(
                    loginCode,
                    challenge?.challenge,
                    challenge?.verifier,
                    `${IKConstants.LOGIN_URL}`,
                    `${IKConstants.CLIENT_ID}`,
                ).then((resp) => {
                    storeTokenResponse(resp);
                    localStorage.removeItem('challenge');
                    localStorage.setItem('tokenExpired', '0');
                    LocalStorageStore.setWasLoggedIn(true);
                    window.postMessage(
                        {
                            type: 'token-refreshed',
                            message: {
                                token: resp.access_token,
                            },
                        },
                        window.origin,
                    );

                    finishSignin();
                }).catch((error) => {
                    console.log('[TOKEN] post token fail', error);

                    // clearLocalStorageToken();
                });
                return;
            }

            if (hash) {
                console.log('[LOGIN] Login with hash');
                const hash2Obj = {};
                // eslint-disable-next-line array-callback-return
                hash.substring(1).split('&').map((hk) => {
                    const temp = hk.split('=');
                    hash2Obj[temp[0]] = temp[1];
                });
                storeTokenResponse(hash2Obj);
                LocalStorageStore.setWasLoggedIn(true);
                finishSignin();
            }
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
