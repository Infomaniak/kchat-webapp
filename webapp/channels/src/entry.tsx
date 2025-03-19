// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';

import {logError} from 'mattermost-redux/actions/errors';

import store from 'stores/redux_store';

import App from 'components/app';

import {AnnouncementBarTypes} from 'utils/constants';
import sentry from 'utils/sentry';
import {setCSRFFromCookie} from 'utils/utils';

// Import our styles
import './sass/styles.scss';
import 'katex/dist/katex.min.css';

import '@mattermost/compass-icons/css/compass-icons.css';
import '@mattermost/components/dist/index.esm.css';

sentry({SENTRY_DSN: 'https://6f9a56a8dc39412c9a67b37869e3f346@sentry-kchat.infomaniak.com/4'});

declare global {
    interface Window {
        publicPath?: string;
    }
}

// This is for anything that needs to be done for ALL react components.
// This runs before we start to render anything.
function preRenderSetup(callwhendone: () => void) {
    const oldOnError = window.onerror;
    window.onerror = (msg, url, line, column, error) => {
        // Ignore exceptions raised by ResizeObserver like:
        // - ResizeObserver loop limit exceeded.
        // - ResizeObserver loop completed with undelivered notifications.
        if (msg.toString()?.startsWith('ResizeObserver loop')) {
            return false;
        }

        store.dispatch(
            logError(
                {
                    type: AnnouncementBarTypes.DEVELOPER,
                    message: 'A JavaScript error in the webapp client has occurred. (msg: ' + msg + ', row: ' + line + ', col: ' + column + ').',
                    intlId: 'apps.error.javascript',
                    stack: error?.stack,
                    url,
                },
                true,
                true,
            ),
        );

        if (oldOnError) {
            return oldOnError(msg, url, line, column, error);
        }
    };
    setCSRFFromCookie();
    callwhendone();
}

function renderRootComponent() {
    ReactDOM.render((
        <App/>
    ),
    document.getElementById('root'));
}

/**
 * Adds a function to be invoked onload appended to any existing onload
 * event handlers.
 */
function appendOnLoadEvent(fn: (evt: Event) => void) {
    if (window.onload) {
        const curronload = window.onload;
        window.onload = (evt) => {
            (curronload as any)(evt);
            fn(evt);
        };
    } else {
        window.onload = fn;
    }
}

appendOnLoadEvent(() => {
    // Do the pre-render setup and call renderRootComponent when done
    preRenderSetup(renderRootComponent);
});
