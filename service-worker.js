// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */
/* eslint-disable consistent-return */

const routesToMatch = ['/api/v4/.*', '/broadcasting/auth'];
self.token = null;

function urlEncodeBody(body) {
    const urlencoded = new URLSearchParams();
    const queryParameters = body.split('&');
    for (const param of queryParameters) {
        const splitParam = param.split('=');
        urlencoded.append(splitParam[0], splitParam[1]);
    }
    return urlencoded;
}

function injectBearer(event, encodeBody = false) {
    if (encodeBody) {
        const responsePromise = event.request.text().then((body) => {
            const newBody = urlEncodeBody(body);
            return fetch(event.request.url, {
                method: 'POST',
                headers: {Authorization: 'Bearer ' + self.token},
                body: newBody,
            });
        });

        return responsePromise;
    }

    const newRequest = new Request(event.request, {
        mode: 'cors',
        headers: {Authorization: 'Bearer ' + self.token},
    });

    return fetch(newRequest);
}

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TOKEN_REFRESHED' && event.data.token !== '') {
        console.log('[SW] Token updated at ' + new Date().toISOString());
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
    console.log('[SW] Claiming fetch');
    const authHeader = event.request.headers.get('Authorization');
    const windowHost = self.location.host;
    const requestUrlSplit = event.request.url.split('https://')[1].split('/');
    const requestHost = requestUrlSplit.shift();
    const route = '/' + requestUrlSplit.join('/').split('?')[0];
    const shouldMatchRoute = routesToMatch.some((rx) => route.match(rx));
    const encodeBody = route === '/broadcasting/auth';

    if (authHeader !== null && windowHost === requestHost && shouldMatchRoute) {
        const authHeaderSplited = authHeader.split(' ');

        if (authHeaderSplited[0] === 'Bearer' && authHeaderSplited[1] && authHeaderSplited[1] !== '') {
            // no need to alter request
        } else if (self.token && self.token !== null) {
            event.respondWith(injectBearer(event, encodeBody));
        }
    } else if (self.token && self.token !== null && windowHost === requestHost) {
        event.respondWith(injectBearer(event, encodeBody));
    }
});
