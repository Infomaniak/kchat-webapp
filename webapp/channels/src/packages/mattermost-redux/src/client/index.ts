// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    Client4 as ClientClass4,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
} from '@mattermost/client';

// eslint-disable-next-line no-restricted-imports
import getUserAgentWithVersion from 'utils/get_user_agent_with_version';

const Client4 = new ClientClass4();
Client4.setWebappVersion(GIT_RELEASE);

Client4.setUserAgent(getUserAgentWithVersion());

export {
    Client4,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
};
