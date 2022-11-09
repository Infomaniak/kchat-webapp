// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import crypto from 'crypto';

import {Client4} from 'mattermost-redux/client';
import {IKConstants} from 'utils/constants-ik';
import LocalStorageStore from 'stores/local_storage_store';
import {redirectUserToDefaultTeam} from 'actions/global_actions';
import {reconnectWebSocket} from 'actions/websocket_actions';

/**
 * Store IKToken infos in localStorage and update Client
 */
export function storeTokenResponse(response: { expires_in?: any; access_token?: any; refresh_token?: any }) {
    // TODO: store in redux
    const d = new Date();
    d.setSeconds(d.getSeconds() + parseInt(response.expires_in, 10));
    localStorage.setItem('IKToken', response.access_token);
    localStorage.setItem('IKRefreshToken', response.refresh_token);
    localStorage.setItem('IKTokenExpire', parseInt(d.getTime() / 1000, 10));
    localStorage.setItem('tokenExpired', '0');
    Client4.setToken(response.access_token);
    Client4.setCSRF(response.access_token);
    Client4.setAuthHeader = true;
}

/**
 * Clear IKToken informations in localStorage
 */
export function clearLocalStorageToken() {
    console.log('[TOKEN] Clear token storage');
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
        console.log('Error redirect');
    });
}

/**
 * check if token is expired
 * @returns bool
 */
export function checkIKTokenIsExpired() {
    const tokenExpire = localStorage.getItem('IKTokenExpire');
    const isExpired = tokenExpire <= parseInt(Date.now() / 1000, 10);
    console.log(`[TOKEN] Check if token is expired => ${isExpired}, tokenExpired => ${localStorage.getItem('tokenExpired')}`);

    if (isExpired) {
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
    console.log('[TOKEN] Token need to be refresh ?');
    return localStorage.getItem('tokenExpired') === '0' && checkIKTokenIsExpired();
}

export function refreshIKToken(redirectToTeam = false) {
    const refreshToken = localStorage.getItem('IKRefreshToken');
    const isRefreshing = localStorage.getItem('refreshingToken');

    if (isRefreshing) {
        return;
    }

    Client4.setToken('');
    Client4.setCSRF('');
    localStorage.setItem('refreshingToken', '1');
    Client4.refreshIKLoginToken(
        refreshToken,
        `${IKConstants.LOGIN_URL}`,
        `${IKConstants.CLIENT_ID}`,
    ).then((resp: { expires_in: string; access_token: string; refresh_token: string }) => {
        storeTokenResponse(resp);
        LocalStorageStore.setWasLoggedIn(true);
        console.log('[TOKEN] Token refreshed');

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
        reconnectWebSocket();

        if (redirectToTeam) {
            redirectUserToDefaultTeam();
        }
    }).catch((error: unknown) => {
        console.log('[TOKEN] Refresh token error ', error);
        localStorage.removeItem('refreshingToken');
    });
}

export function revokeIKToken() {
    const token = localStorage.getItem('IKToken');
    Client4.revokeIKLoginToken(
        token,
        `${IKConstants.LOGIN_URL}`,
    ).then((resp: any) => {
        if (resp.data && resp.data === true) {
            console.log('[TOKEN] Token revoked');
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
        }
    }).catch((error: unknown) => {
        console.log('[TOKEN] Revoke token error ', error);
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
