// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */
import * as Sentry from '@sentry/react';

interface Args {
    SENTRY_DSN: string;
}

// Webpack global var
declare const GIT_RELEASE: string;

const isLocalhost = (host: string) => host.startsWith('localhost') || host.startsWith('local.') || host.startsWith('kchat.devd');
const isCanaryOrPreprod = GIT_RELEASE.includes('-next') || GIT_RELEASE.includes('-rc');

const bool = <T>(x: T | false | undefined | null | '' | 0): x is T => Boolean(x);

export default function init({SENTRY_DSN}: Args) {
    const {host} = window.location;

    if (!SENTRY_DSN || isLocalhost(host)) {
        return;
    }

    const config: Sentry.BrowserOptions = {
        dsn: SENTRY_DSN,
        release: GIT_RELEASE, //eslint-disable-line no-process-env
        environment: host.split('.').splice(1).join('.'),
        normalizeDepth: 5,
        integrations: [
            true && new Sentry.BrowserTracing(),
            isCanaryOrPreprod && new Sentry.Replay(),
        ].filter(bool),
        tracesSampleRate: 0.1,
        ignoreErrors: [

            // Ignore random plugins/extensions
            'top.GLOBALS',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',

            // https://bugzilla.mozilla.org/show_bug.cgi?id=1678243
            'XDR encoding failure',
            'Request timed out',
            'No network connection',

            // 'Failed to fetch',
            // 'NetworkError when attempting to fetch resource.',
            'webkitExitFullScreen',
            'InactiveSession',
            /chrome-extension/,
            /moz-extension/,
            /ResizeObserver loop/,
        ],
    };

    if (isCanaryOrPreprod) {
        config.replaysSessionSampleRate = 0.1;
        config.replaysOnErrorSampleRate = 1.0;
    }

    Sentry.init(config);
}
