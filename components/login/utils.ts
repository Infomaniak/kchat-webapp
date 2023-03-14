// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import crypto from 'crypto';

import {Client4} from 'mattermost-redux/client';
import {IKConstants} from 'utils/constants-ik';
import LocalStorageStore from 'stores/local_storage_store';
import {redirectUserToDefaultTeam} from 'actions/global_actions';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getDesktopVersion} from 'utils/user_agent';

let REFRESH_PROMISE: Promise<any> | null = null;

// eslint-disable-next-line no-process-env
const v2DefaultAuthServer = process.env.BASE_URL;

/**
 * Store IKToken infos in localStorage and update Client
 */
export function storeTokenResponse(response: { expires_in?: any; access_token?: any; refresh_token?: any }) {
    // TODO: store in redux
    const d = new Date();
    d.setHours(d.getHours() + 2);
    localStorage.setItem('IKToken', response.access_token);
    localStorage.setItem('IKRefreshToken', response.refresh_token);
    localStorage.setItem('IKTokenExpire', parseInt(d.getTime() / 1000, 10));
    localStorage.setItem('tokenExpired', '0');
    Client4.setToken(response.access_token);
    Client4.setCSRF(response.access_token);
    Client4.setAuthHeader = true;
    console.log('[login/utils > storeTokenResponse] new token stored at: ', d);
    Client4.setWebappVersion(GIT_RELEASE);
}

/**
 * Clear IKToken informations in localStorage
 */
export function clearLocalStorageToken() {
    localStorage.removeItem('IKToken');
    localStorage.removeItem('IKRefreshToken');
    localStorage.removeItem('IKTokenExpire');
    localStorage.setItem('tokenExpired', '1');
    window.postMessage(
        {
            type: 'token-cleared',
            message: {
                token: null,
            },
        },
        window.origin,
    );
    console.log('[login/utils > clearLocalStorageToken] token storage cleared at: ', new Date());
}

/**
 * get code_verifier for challenge
 * @returns string
 */
export function getCodeVerifier() {
    const ramdonByte = crypto.randomBytes(33);
    const hash =
               crypto.createHash('sha256').update(ramdonByte).digest();
    return hash.toString('base64').
        replace(/\+/g, '-').
        replace(/\//g, '_').
        replace(/[=]/g, '');
}

/**
 * Generate code_challenge for oauth
 * @param codeVerifier string
 * @returns string
 */
export async function generateCodeChallenge(codeVerifier: string) {
    const hash =
           crypto.createHash('sha256').update(codeVerifier).digest();
    return hash.toString('base64').
        replace(/\+/g, '-').
        replace(/\//g, '_').
        replace(/[=]/g, '');
}

/**
 * get code_challenge and redirect to IK Login
 */
export function getChallengeAndRedirectToLogin(infinite = false) {
    const redirectTo = window.location.origin.endsWith('/') ? window.location.origin : `${window.location.origin}/`;
    const codeVerifier = getCodeVerifier();
    let codeChallenge = '';

    generateCodeChallenge(codeVerifier).then((challenge) => {
        codeChallenge = challenge;

        // TODO: store in redux instead of localstorage
        localStorage.setItem('challenge', JSON.stringify({verifier: codeVerifier, challenge: codeChallenge}));

        // TODO: add env for login url and/or current server
        window.location.assign(`${IKConstants.LOGIN_URL}authorize?code_challenge=${codeChallenge}${infinite ? '' : '&access_type=offline'}&code_challenge_method=S256&client_id=${IKConstants.CLIENT_ID}&response_type=code&redirect_uri=${redirectTo}`);
    }).catch(() => {
        console.log('[login/utils > getChallengeAndRedirectToLogin] error redirect');
    });
}

/**
 * check if token is expired
 * @returns bool
 */
export function checkIKTokenIsExpired() {
    if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.1.0')) {
        return false;
    }
    const tokenExpire = localStorage.getItem('IKTokenExpire');
    const isExpired = tokenExpire <= parseInt(Date.now() / 1000, 10);

    if (isExpired) {
        console.log('[login/utils > checkIKTokenIsExpired] token is expired');
        localStorage.setItem('tokenExpired', '1');
    }
    return isExpired;
}

/**
 * check if token is expiring in 1 min
 * @returns bool
 */
export function checkIKTokenExpiresSoon(): boolean {
    const tokenExpire = localStorage.getItem('IKTokenExpire');
    const isExpiredInOneMinute = parseInt(tokenExpire as string, 10) <= ((Date.now() / 1000) + 60);

    return isExpiredInOneMinute;
}

/**
 * check if token is expired once
 * @returns bool
 */
export function needRefreshToken() {
    return localStorage.getItem('tokenExpired') === '0' && checkIKTokenIsExpired();
}

export function isDefaultAuthServer() {
    return window.location.origin === v2DefaultAuthServer;
}

function storeTokenV2(tokenData: {token: string, refreshToken: string, expiresAt: number}) {
    const {token, refreshToken, expiresAt} = tokenData;
    localStorage.setItem('IKToken', token);
    localStorage.setItem('IKRefreshToken', refreshToken);
    localStorage.setItem('IKTokenExpire', expiresAt);
    localStorage.setItem('tokenExpired', '0');
    Client4.setToken(token);
    Client4.setCSRF(token);
    Client4.setAuthHeader = true;
}

async function refreshTokenV2() {
    try {
        const newToken = await window.authManager.refreshToken();
        console.log(newToken);
        storeTokenV2(newToken);
    } catch (error) {
        console.error(error);
        window.postMessage(
            {
                type: 'reset-teams',
                message: {},
            },
            window.origin,
        );
    }
}

function isValidTokenV2(token: {token: string; refreshToken: string; expiresAt: number}) {
    const isExpiredInOneMinute = token.expiresAt <= ((Date.now() / 1000) + 60);

    return !isExpiredInOneMinute;
}

export async function refreshIKToken(redirectToTeam = false): Promise<any> {
    if (isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.0.0')) {
        const updatedToken = await window.authManager.tokenRequest();
        if (!Object.keys(updatedToken).length) {
            clearLocalStorageToken();
            return Promise.reject(new Error('missing refresh token'));
        } else if (isValidTokenV2(updatedToken)) {
            storeTokenV2(updatedToken);
        } else {
            await refreshTokenV2();
        }

        if (redirectToTeam) {
            redirectUserToDefaultTeam();
        }
    } else {
        const refreshToken = localStorage.getItem('IKRefreshToken');

        if (!refreshToken) {
            return Promise.reject(new Error('missing refresh token'));
        }

        if (REFRESH_PROMISE) {
            return REFRESH_PROMISE as Promise<any>;
        }

        Client4.setToken('');
        Client4.setCSRF('');

        // eslint-disable-next-line consistent-return
        REFRESH_PROMISE = new Promise((resolve, reject) => {
            Client4.refreshIKLoginToken(
                refreshToken,
                `${IKConstants.LOGIN_URL}`,
                `${IKConstants.CLIENT_ID}`,
            ).then((resp: { expires_in: string; access_token: string; refresh_token: string }) => {
                storeTokenResponse(resp);
                LocalStorageStore.setWasLoggedIn(true);

                window.postMessage(
                    {
                        type: 'token-refreshed',
                        message: {
                            token: resp.access_token,
                            refreshToken: resp.refresh_token,
                            expiresAt: parseInt(Date.now() / 1000) + resp.expires_in,
                        },
                    },
                    window.origin,
                );

                REFRESH_PROMISE = null;
                if (redirectToTeam) {
                    redirectUserToDefaultTeam();
                }
                resolve(resp);
            }).catch((error: unknown) => {
                console.log('[login/utils > refreshIKToken] refresh token error at: ', new Date());
                console.warn(error);
                console.log('[login/utils > refreshIKToken] keeping old token');
                REFRESH_PROMISE = null;
                reject(error);
            });
        });

        return REFRESH_PROMISE;
    }
}
