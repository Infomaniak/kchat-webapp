// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

self.token = null;
self.addEventListener('message', (event) => {
    if (event.data.token && event.data.token !== '') {
        self.token = event.data.token;
    }
});

self.addEventListener('install', () => {
    self.skipWaiting();
    console.log('Service worker has been installed');
});

self.addEventListener('activate', () => {
    console.log('Claiming control');
    return self.clients.claim().catch((claimError) => {
        console.log('Failed to claim control', claimError);
    });
});

self.addEventListener('fetch', (event) => {
    const authHeader = event.request.headers.get('Authorization');
    if (authHeader !== null) {
        const authHeaderSplited = authHeader.split(' ');

        if (authHeaderSplited[0] === 'Bearer' && authHeaderSplited[1] && authHeaderSplited[1] !== '') {
            event.respondWith(fetch(event.request));
        } else if (self.token && self.token !== null) {
            const newRequest = new Request(event.request, {
                headers: {Authorization: `Bearer ${self.token}`},
                mode: 'cors',
            });
            event.respondWith(fetch(newRequest));
        }
    } else if (self.token && self.token !== null) {
        const newRequest = new Request(event.request, {
            headers: {Authorization: `Bearer ${self.token}`},
            mode: 'cors',
        });
        event.respondWith(fetch(newRequest));
    }
});
