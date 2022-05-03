// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

self.addEventListener('fetch', (event) => {
    console.log('evented', event);

    // let token = new URL(location).searchParams.get('token');
    const token = 'test token';
    console.log('my token', token);
    const newRequest = new Request(event.request, {
        headers: {Authorization: `Bearer ${token}`},
        mode: 'no-cors',
    });
    return fetch(newRequest);
});
