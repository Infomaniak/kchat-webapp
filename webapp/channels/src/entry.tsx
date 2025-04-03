// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';

import {logError, LogErrorBarMode} from 'mattermost-redux/actions/errors';

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
function preRenderSetup(onPreRenderSetupReady: () => void) {
    const oldOnError = window.onerror;
    window.onerror = (msg, url, line, column, error) => {
        // Ignore exceptions raised by ResizeObserver like:
        // - ResizeObserver loop limit exceeded.
        // - ResizeObserver loop completed with undelivered notifications.
        if (msg.toString()?.startsWith('ResizeObserver loop')) {
            return;
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
                {errorBarMode: LogErrorBarMode.InDevMode},
            ),
        );

        if (oldOnError) {
            oldOnError(msg, url, line, column, error);
        }
    };

    setCSRFFromCookie();

    onPreRenderSetupReady();
}

function renderReactRootComponent() {
    ReactDOM.render((
        <App/>
    ),
    document.getElementById('root'));
}

/**
 * Adds a function to be invoked when the DOM content is loaded.
 */
function appendOnDOMContentLoadedEvent(onDomContentReady: () => void) {
    if (document.readyState === 'loading') {
        // If the DOM hasn't finished loading, add an event listener and call the function when it does
        document.addEventListener('DOMContentLoaded', onDomContentReady);
    } else {
        // If the DOM is already loaded, call the function immediately
        onDomContentReady();
    }
}

appendOnDOMContentLoadedEvent(() => {
    // Do the pre-render setup and call renderReactRootComponent when done
    preRenderSetup(renderReactRootComponent);
});
