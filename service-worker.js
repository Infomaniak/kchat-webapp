// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
self.token = null;
self.addEventListener('message', (event) => {
    if (event.data.token && event.data.token !== '') {
        self.token = event.data.token;
    }
});

self.addEventListener('install', () => {
    console.log('Service worker has been installed');
});

self.addEventListener('activate', () => {
    console.log('Claiming control');
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    console.log("catch fetch");
    if (self.token && self.token !== null) {
        const newRequest = new Request(event.request, {
            headers: {Authorization: `Bearer ${self.token}`},
            mode: 'cors',
        });
        return fetch(newRequest);
    }
});
