// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable @typescript-eslint/naming-convention */
import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';

interface Args {
    SENTRY_DSN: string;
}

// Webpack global var
declare const COMMIT_HASH: string;

const isLocalhost = (host: string) => host.startsWith('localhost') || host.startsWith('local.');

export default function init({SENTRY_DSN}: Args) {
    const {host} = window.location;

    if (!SENTRY_DSN || isLocalhost(host)) {
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        release: COMMIT_HASH, //eslint-disable-line no-process-env
        environment: host.split('.').splice(1).join('.'),
        normalizeDepth: 5,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 1.0,
        ignoreErrors: [

            // Ignore random plugins/extensions
            'top.GLOBALS',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',

            // https://bugzilla.mozilla.org/show_bug.cgi?id=1678243
            'XDR encoding failure',
            'Request timed out',
            'No network connection',
            'Failed to fetch',
            'NetworkError when attempting to fetch resource.',
            'No network connection',
            'webkitExitFullScreen',
            'InactiveSession',
            'UnhandledRejection',
            /chrome-extension/,
            /moz-extension/,
            'ChunkLoadError', // WebPack loading source code.
            /ResizeObserver loop/,
        ],
    });
}
