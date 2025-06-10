// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Sentry from '@sentry/react';
import cloneDeep from 'lodash/cloneDeep';

import type {GlobalState} from 'types/store';

type SentryReadyState = Partial<GlobalState> | null | { error: string };
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

            //Ik: For notification, user didn't interact before the sound is played
            'NotAllowedError: play() failed because the user didn\'t interact with the document first',
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

export function transformStateForSentry(state: GlobalState | undefined): SentryReadyState {
    if (!state) {
        return null;
    }

    const transformedState = cloneDeep(state);

    if (transformedState.entities?.posts?.posts) {
        Object.values(transformedState.entities.posts.posts).forEach((post) => {
            if (post) {
                post.message = '[REDACTED_MESSAGE]';
            }
        });
    }

    if (transformedState.entities?.users?.profiles) {
        Object.entries(transformedState.entities.users.profiles).forEach(([userId, user]) => {
            if (user) {
                user.email = '[REDACTED_EMAIL]';
                user.first_name = '[REDACTED]';
                user.last_name = '[REDACTED]';
                user.nickname = '[REDACTED]';
                user.username = `user_${userId.substring(0, 6)}`;
            }
        });
    }

    if (transformedState.entities?.channels?.channels) {
        Object.entries(transformedState.entities.channels.channels).forEach(([channelId, channel]) => {
            if (channel) {
                channel.display_name = `Channel ${channelId.substring(0, 6)}`;
                channel.name = `channel-${channelId.substring(0, 6)}`;
                channel.header = '[REDACTED_HEADER]';
                channel.purpose = '[REDACTED_PURPOSE]';
            }
        });
    }

    return transformedState;
}
