// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import crypto from 'crypto';

import {Client4} from 'mattermost-redux/client';
import {IKConstants} from 'utils/constants-ik';
import LocalStorageStore from 'stores/local_storage_store';
import {redirectUserToDefaultTeam} from 'actions/global_actions';

// import {reconnectWebSocket} from 'actions/websocket_actions';

let REFRESH_PROMISE: Promise<any> | null;

/**
 * Store IKToken infos in localStorage and update Client
 */
export function storeTokenResponse(response: { expires_in?: any; access_token?: any; refresh_token?: any }) {
    // TODO: store in redux
    const d = new Date();
    d.setSeconds(d.getSeconds() + parseInt(response.expires_in, 10)); // add additional hour to expiry for backend timezone bug
    localStorage.setItem('IKToken', response.access_token);
    localStorage.setItem('IKRefreshToken', response.refresh_token);
    localStorage.setItem('IKTokenExpire', parseInt(d.getTime() / 1000, 10));
    localStorage.setItem('tokenExpired', '0');
    Client4.setToken(response.access_token);
    Client4.setCSRF(response.access_token);
    Client4.setAuthHeader = true;
    console.log('[login/utils > storeTokenResponse] token stored at: ', d);
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
export function getChallengeAndRedirectToLogin() {
    const redirectTo = window.location.origin.endsWith('/') ? window.location.origin : `${window.location.origin}/`;
    const codeVerifier = getCodeVerifier();
    let codeChallenge = '';

    generateCodeChallenge(codeVerifier).then((challenge) => {
        codeChallenge = challenge;

        // TODO: store in redux instead of localstorage
        localStorage.setItem('challenge', JSON.stringify({verifier: codeVerifier, challenge: codeChallenge}));

        // TODO: add env for login url and/or current server
        window.location.assign(`${IKConstants.LOGIN_URL}authorize?access_type=offline&code_challenge=${codeChallenge}&code_challenge_method=S256&client_id=${IKConstants.CLIENT_ID}&response_type=code&redirect_uri=${redirectTo}`);
    }).catch(() => {
        console.log('[login/utils > getChallengeAndRedirectToLogin] error redirect');
    });
}

/**
 * check if token is expired
 * @returns bool
 */
export function checkIKTokenIsExpired() {
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

export function refreshIKToken(redirectToTeam = false): Promise<any> {
    const refreshToken = localStorage.getItem('IKRefreshToken');
    const isRefreshing = localStorage.getItem('refreshingToken');

    if (isRefreshing) {
        return REFRESH_PROMISE as Promise<any>;
    }

    // Client4.setToken('');
    // Client4.setCSRF('');

    localStorage.setItem('refreshingToken', '1');

    // eslint-disable-next-line consistent-return
    REFRESH_PROMISE = new Promise((resolve, reject) => {
        Client4.refreshIKLoginToken(
            refreshToken,
            `${IKConstants.LOGIN_URL}`,
            `${IKConstants.CLIENT_ID}`,
        ).then((resp: { expires_in: string; access_token: string; refresh_token: string }) => {
            storeTokenResponse(resp);
            LocalStorageStore.setWasLoggedIn(true);
            console.log('[login/utils > refreshIKToken] token refreshed at: ', new Date());

            window.postMessage(
                {
                    type: 'token-refreshed',
                    message: {
                        token: resp.access_token,
                    },
                },
                window.origin,
            );

            localStorage.removeItem('refreshingToken');

            // Refresh the websockets as we just changed Bearer Token
            // reconnectWebSocket();

            if (redirectToTeam) {
                redirectUserToDefaultTeam();
            }
            resolve(resp);
        }).catch((error: unknown) => {
            console.log('[login/utils > refreshIKToken] refresh token error at: ', new Date());
            console.warn(error);
            console.log('[login/utils > refreshIKToken] keeping old token');
            localStorage.removeItem('refreshingToken');
            reject(error);
        });
    });

    return REFRESH_PROMISE;
}

export function revokeIKToken() {
    const token = localStorage.getItem('IKToken');
    Client4.revokeIKLoginToken(
        token,
        `${IKConstants.LOGIN_URL}`,
    ).then((resp: any) => {
        if (resp.data && resp.data === true) {
            console.log('[login/utils > revokeIKToken] token revoked');

            // waiting for app release
            /*clearLocalStorageToken();
            window.postMessage(
                {
                    type: 'token-cleared',
                    message: {
                        token: null,
                    },
                },
                window.origin,
            );*/
        }
    }).catch((error: unknown) => {
        console.log('[login/utils > revokeIKToken] revoke token error ', error);
    }).finally(() => {
        Client4.setToken('');
        Client4.setCSRF('');

        // Waiting new app release
        clearLocalStorageToken();
        window.postMessage(
            {
                type: 'token-cleared',
                message: {
                    token: null,
                },
            },
            window.origin,
        );
    });
}
