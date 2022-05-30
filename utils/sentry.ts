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

        // Disable client reports. Client reports are used by sentry to retry events that failed to send on visibility change.
        // Unfortunately Sentry does not use the custom transport for those, and thus fails to add the headers the API requires.
        sendClientReports: false,
        ignoreErrors: [

            // Ignore random plugins/extensions
            'top.GLOBALS',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',
            'atomicFindClose',
            'conduitPage',

            // https://bugzilla.mozilla.org/show_bug.cgi?id=1678243
            'XDR encoding failure',
            'Request timed out',
            'No network connection',
            'Failed to fetch',
            'NetworkError when attempting to fetch resource.',
            'No network connection',
            'webkitExitFullScreen', // Bug in Firefox for iOS.
            'InactiveSession',
            'UnhandledRejection', // Happens too often in extensions and we have lints for that, so should be safe to ignore.
            /chrome-extension/,
            /moz-extension/,
            'ChunkLoadError', // WebPack loading source code.
            /ResizeObserver loop/, // Chromium bug https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
        ],
    });
}
