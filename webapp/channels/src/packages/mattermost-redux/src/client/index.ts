// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    Client4 as ClientClass4,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
} from '@mattermost/client';

const Client4 = new ClientClass4();
Client4.setWebappVersion(GIT_RELEASE);

const userAgent = [window?.navigator?.userAgent, `kChat/${GIT_RELEASE?.trim()}`, `Build/${COMMIT_HASH?.trim()}`].filter(Boolean).join(' ');
Client4.setUserAgent(userAgent);

export {
    Client4,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
};
