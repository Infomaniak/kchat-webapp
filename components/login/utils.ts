// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import crypto from 'crypto';

import {Client4} from 'mattermost-redux/client';
import {IKConstants} from 'utils/constants-ik';
import LocalStorageStore from 'stores/local_storage_store';
import {redirectUserToDefaultTeam} from 'actions/global_actions';

const REFRESH_TOKEN_TIME_MARGIN = 30; // How many seconds to refresh before token expires
const OFFLINE_ATTEMPT_INTERVAL = 2000; // In milliseconds

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
    localStorage.removeItem('IKToken');
    localStorage.removeItem('IKRefreshToken');
    localStorage.removeItem('IKTokenExpire');
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
    if (isExpired) {
        localStorage.setItem('tokenExpired', '1');
    }
    return isExpired;
}

/**
 * check if token is expired once
 * @returns bool
 */
export function needRefreshToken() {
    return localStorage.getItem('tokenExpired') === '0' && checkIKTokenIsExpired();
}

export function refreshIKToken(redirectToTeam = false, periodic = false) {
    const refreshToken = localStorage.getItem('IKRefreshToken');
    if (!refreshToken) {
        clearLocalStorageToken();
        getChallengeAndRedirectToLogin();
        return;
    }
    Client4.setToken('');
    Client4.setCSRF('');

    Client4.refreshIKLoginToken(
        refreshToken,
        `${IKConstants.LOGIN_URL}`,
        `${IKConstants.CLIENT_ID}`,
    ).then((resp) => {
        console.log('getRefreshToken', resp);
        if (periodic) {
            setTimeout(refreshIKToken, 1000 * (resp.expires_in - REFRESH_TOKEN_TIME_MARGIN), false, true);
        }

        storeTokenResponse(resp);
        LocalStorageStore.setWasLoggedIn(true);
        if (redirectToTeam) {
            redirectUserToDefaultTeam();
        }
    }).catch((error) => {
        if (window.navigator.onLine) {
            console.log('catch refresh error', error);
            clearLocalStorageToken();
            getChallengeAndRedirectToLogin();
        } else {
            console.log('Offline, waiting for connection');
            setTimeout(refreshIKToken, OFFLINE_ATTEMPT_INTERVAL, redirectToTeam, periodic);
        }
    });
}
