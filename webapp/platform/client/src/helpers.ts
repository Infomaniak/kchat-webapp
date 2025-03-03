// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @ts-nocheck

export function buildQueryString(parameters: Record<string, any>): string {
    const keys = Object.keys(parameters);
    if (keys.length === 0) {
        return '';
    }

    const queryParams = Object.entries(parameters).
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        filter(([_, value]) => value !== undefined).
        map(([key, value]) => `${key}=${encodeURIComponent(value)}`).
        join('&');

    return queryParams.length > 0 ? `?${queryParams}` : '';
}

export function setUserAgent(window, userAgent) {
    // Works on Firefox, Chrome, Opera and IE9+
    if (navigator.__defineGetter__) {
        navigator.__defineGetter__('userAgent', function () {
            return userAgent;
        });
    } else if (Object.defineProperty) {
        Object.defineProperty(navigator, 'userAgent', {
            get: function () {
                return userAgent;
            }
        });
    }
    // Works on Safari
    if (window.navigator.userAgent !== userAgent) {
        const userAgentProp = {
            get: function () {
                return userAgent;
            }
        };
        try {
            Object.defineProperty(window.navigator, 'userAgent', userAgentProp);
        } catch (e) {
            window.navigator = Object.create(navigator, {
                userAgent: userAgentProp
            });
        }
    }
}
