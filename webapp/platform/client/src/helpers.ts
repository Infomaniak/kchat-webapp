/* eslint-disable no-underscore-dangle */
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
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

export function setUserAgent(window: Window, userAgent: string) {
    try {
        // Works on Firefox, Chrome, Opera and IE9+
        // @ts-expect-error depends on the browser
        if ((navigator as Window['navigator']).__defineGetter__) {
            // @ts-expect-error depends on the browser
            (navigator as Window['navigator']).__defineGetter__('userAgent', () => {
                return userAgent;
            });
        } else if (Object.defineProperty) {
            Object.defineProperty(navigator, 'userAgent', {
                get() {
                    return userAgent;
                },
            });
        }

        // Works on Safari
        if (window.navigator.userAgent !== userAgent) {
            const userAgentProp = {
                get() {
                    return userAgent;
                },
            };
            try {
                Object.defineProperty(window.navigator, 'userAgent', userAgentProp);
            } catch (e) {
                (window.navigator as Window['navigator']) = Object.create(navigator, {
                    userAgent: userAgentProp,
                });
            }
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[app/debug] unable to set userAgent.', e);
    }
}
