// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const getCookieDomain = () => {
    const url = process.env.BASE_URL!; // eslint-disable-line no-process-env
    return url.substring(url.lastIndexOf('.', url.lastIndexOf('.') - 1) + 1);
};

export const getCookie = (cookieName: string) => {
    for (const cookie of document.cookie.split('; ')) {
        const [name, value] = cookie.split('=');
        if (name && value && name === cookieName) {
            return value;
        }
    }
    return undefined;
};

export const setCookie = (cookieName: string, value: string) => {
    const domain = getCookieDomain();
    document.cookie = `${cookieName}=${value}; path=/; domain=${domain}; secure; samesite=lax; max-age=31536000`;
};
