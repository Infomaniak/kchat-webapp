// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {redirectUserToDefaultTeam} from 'actions/global_actions';
import LocalStorageStore from 'stores/local_storage_store';

import LoadingIk from 'components/loading_ik';

import {isDesktopApp} from 'utils/user_agent';

import {getChallengeAndRedirectToLogin, isDefaultAuthServer} from './utils';

import './login.scss';

const Login = () => {
    const currentUser = useSelector(getCurrentUser);

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log('[components/login] init login component');
        // eslint-disable-next-line no-console
        console.log('[components/login] get was logged in => ', LocalStorageStore.getWasLoggedIn());

        if (isDesktopApp()) {
            window.authManager.tokenRequest().then((data: {
                token: string;
                refreshToken?: string;
                expiresAt?: number;
            }) => {
                // eslint-disable-next-line no-negated-condition
                if (!Object.keys(data).length) {
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
                    if (data.refreshToken) {
                        localStorage.setItem('IKRefreshToken', data.refreshToken);
                    }
                    if (data.expiresAt) {
                        localStorage.setItem('IKTokenExpire', (data.expiresAt).toString());
                    }

                    Client4.setToken(data.token);
                    Client4.setCSRF(data.token);
                    Client4.setAuthHeader = true;

                    redirectUserToDefaultTeam();
                }
            });
        } else if (currentUser) {
            // Web auth redirects are still triggered throught client4 so we
            // dont need to do any checks here.
            // eslint-disable-next-line no-console
            console.log('[components/login] current user is ok -> redirecting to team');
            redirectUserToDefaultTeam();
        }
    }, []); //eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='login-body'>
            <div className='login-body-content'>
                <LoadingIk/>
            </div>
        </div>
    );
};

export default Login;
