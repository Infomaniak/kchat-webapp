// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {History} from 'history';
import {createBrowserHistory} from 'history';

import {getModule} from 'module_registry';
import {isDesktopApp} from 'utils/user_agent';

import {NotificationsSettingsPath} from './constants';

const b = createBrowserHistory({basename: window.basename});
const isDesktop = isDesktopApp(); // && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '5.0.0');

type Data = {
    type?: string;
    message?: Record<string, string>;
}

type Params = {
    origin?: string;
    data?: Data;
}

window.addEventListener('message', ({origin, data: {type, message = {}} = {}}: Params = {}) => {
    if (origin !== window.location.origin) {
        return;
    }

    switch (type) {
    case 'browser-history-push-return': {
        if (message.pathName) {
            const {pathName} = message;
            b.push(pathName);
        }
        break;
    }
    }
});

const browserHistory = {
    ...b,
    push: (path: string | { pathname: string }, ...args: string[]) => {
        if (isDesktop) {
            window.postMessage(
                {
                    type: 'browser-history-push',
                    message: {
                        path: typeof path === 'object' ? path.pathname : path,
                    },
                },
                window.location.origin,
            );
        } else {
            b.push(path, ...args);
        }
    },
};

/**
 * Returns the current history object.
 *
 * If you're calling this from within a React component, consider using the useHistory hook from react-router-dom.
 */
export function getHistory() {
    return getModule<History>('utils/browser_history') ?? browserHistory;
}

export const hasNotificationsSettingsPathInUrl = () => window.location.hash.indexOf(NotificationsSettingsPath) !== -1;

