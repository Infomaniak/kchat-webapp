// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */
import * as Sentry from '@sentry/react';

interface Args {
    SENTRY_DSN: string;
}

// Webpack global var
// declare const COMMIT_HASH: string;
declare const GIT_RELEASE: string;

const isLocalhost = (host: string) => host.startsWith('localhost') || host.startsWith('local.') || host.startsWith('kchat.devd');

export default function init({SENTRY_DSN}: Args) {
    const {host} = window.location;

    if (!SENTRY_DSN || isLocalhost(host)) {
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        release: GIT_RELEASE, //eslint-disable-line no-process-env
        environment: host.split('.').splice(1).join('.'),
        normalizeDepth: 5,
        integrations: [
            new Sentry.BrowserTracing(),
            new Sentry.Replay(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
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
    });
}
