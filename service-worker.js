// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */
/* eslint-disable consistent-return */

const routesToMatch = ['/api/v4/emoji/.*', '/api/v4/files/.*'];
self.token = null;

function injectBearer(event) {
    const newRequest = new Request(event.request, {
        mode: 'cors',
        headers: {Authorization: 'Bearer ' + self.token},
    });
    return fetch(newRequest);
}

self.addEventListener('message', (event) => {
    if (event.data.token && event.data.token !== '') {
        self.token = event.data.token;
    }
});

self.addEventListener('install', () => {
    self.skipWaiting();
    console.log('[SW] Service worker has been installed');
});

self.addEventListener('activate', () => {
    console.log('[SW] Claiming control');
    self.clients.claim().catch((claimError) => {
        console.log('[SW] Failed to claim control', claimError);
    });
});

self.addEventListener('fetch', (event) => {
    const authHeader = event.request.headers.get('Authorization');
    const windowHost = self.location.host;
    const requestUrlSplit = event.request.url.split('https://')[1].split('/');
    const requestHost = requestUrlSplit.shift();
    const route = '/' + requestUrlSplit.join('/').split('?')[0];
    const shouldMatchRoute = routesToMatch.some((rx) => route.match(rx));

    if (authHeader !== null && windowHost === requestHost && shouldMatchRoute) {
        const authHeaderSplited = authHeader.split(' ');

        if (authHeaderSplited[0] === 'Bearer' && authHeaderSplited[1] && authHeaderSplited[1] !== '') {
            // no need to alter request
        } else if (self.token && self.token !== null) {
            return injectBearer(event);
        }
    } else if (self.token && self.token !== null && windowHost === requestHost && shouldMatchRoute) {
        return injectBearer(event);
    }
});
