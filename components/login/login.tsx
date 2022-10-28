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

import {isDesktopApp} from 'utils/user_agent';

import './login.scss';
import {checkIKTokenIsExpired, clearLocalStorageToken, getChallengeAndRedirectToLogin, refreshIKToken} from './utils';

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

            // If need to refresh the token
            if ((localStorage.getItem('IKTokenExpire') && checkIKTokenIsExpired()) || (localStorage.getItem('IKRefreshToken') && !token)) {
                refreshIKToken(true);

                return;
            }

            if (!token || !localStorage.getItem('IKRefreshToken') || !localStorage.getItem('IKTokenExpire')) {
                clearLocalStorageToken();
                getChallengeAndRedirectToLogin();
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
