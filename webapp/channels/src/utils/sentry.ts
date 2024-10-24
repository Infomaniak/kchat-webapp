// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Sentry from '@sentry/react';

interface Args {
    SENTRY_DSN: string;
}

// Webpack global var
declare const GIT_RELEASE: ReturnType<JSON['stringify']>;

const isLocalhost = (host: string) => host.startsWith('localhost') || host.startsWith('infomaniak.local.') || host.startsWith('kchat.local.') || host.startsWith('local.') || host.startsWith('kchat.devd');
const isCanaryOrPreprod = GIT_RELEASE.includes('-next') || GIT_RELEASE.includes('-rc');

const bool = <T>(x: T | false | undefined | null | '' | 0): x is T => Boolean(x);

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function init({SENTRY_DSN}: Args) {
    const {host} = window.location;

    if (!SENTRY_DSN || isLocalhost(host)) {
        return;
    }

    const logIntegrations = [
        isCanaryOrPreprod && 'bt',
        isCanaryOrPreprod && 'replay',
    ].filter(bool);

    // eslint-disable-next-line no-console
    console.log('[sentry integrations]', logIntegrations);

    const config: Sentry.BrowserOptions = {
        dsn: SENTRY_DSN,
        release: GIT_RELEASE, //eslint-disable-line no-process-env
        environment: host.split('.').splice(1).join('.'),
        normalizeDepth: 5,
        integrations: [
            isCanaryOrPreprod && new Sentry.BrowserTracing(),
            isCanaryOrPreprod && new Sentry.Replay(),
        ].filter(bool),
        // eslint-disable-next-line no-process-env
        tracesSampleRate: parseFloat(process.env.SENTRY_PERFORMANCE_SAMPLE_RATE!),
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
        config.replaysSessionSampleRate = 0.01;
        config.replaysOnErrorSampleRate = 1.0;
        // eslint-disable-next-line no-console
        console.log('[sentry replay]', {replaysSessionSampleRate: config.replaysSessionSampleRate, replaysOnErrorSampleRate: config.replaysOnErrorSampleRate});
    }

    Sentry.init(config);
}
