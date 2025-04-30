// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {redirectUserToDefaultTeam} from 'actions/global_actions';
import LocalStorageStore from 'stores/local_storage_store';

import LoadingIk from 'components/loading_ik';

import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';

import {getChallengeAndRedirectToLogin, isDefaultAuthServer} from './utils';

import './login.scss';

const Login = () => {
    const currentUser = useSelector(getCurrentUser);

    const tokenInterval = useRef<NodeJS.Timer>();

    const closeSessionExpiredNotification = useRef<() => void>();

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
                console.log('[components/login] tokenRequest resolved with data:', data);
                if (!Object.keys(data).length) { // eslint-disable-line no-negated-condition
                    if (isDefaultAuthServer()) {
                        console.log('[components/login] calling getChallengeAndRedirectToLogin');
                        getChallengeAndRedirectToLogin(isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.1.0'));
                    } else {
                        console.log('[components/login] reseting teams');
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
                        console.log('[components/login] setting IKRefreshToken');
                        localStorage.setItem('IKRefreshToken', data.refreshToken);
                    }
                    if (data.expiresAt) {
                        console.log('[components/login] setting IKTokenExpire');
                        localStorage.setItem('IKTokenExpire', (data.expiresAt).toString());
                    }
                    console.log('[components/login] setting Client4 token and CSRF');
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

        // We love hooks
        return () => {
            // eslint-disable-next-line no-console
            console.log('login effect cleanup');
            clearInterval(tokenInterval.current as NodeJS.Timer);
            if (closeSessionExpiredNotification!.current) {
                closeSessionExpiredNotification.current();
                closeSessionExpiredNotification.current = undefined;
            }
        };
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
