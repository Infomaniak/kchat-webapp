// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import mattermostIcon from 'images/icon50x50.png';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import * as ServerVersion from 'utils/server_version';
import * as UserAgent from 'utils/user_agent';

import ExternalLink from 'components/external_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import type {Notice} from 'components/system_notice/types';

// Notices are objects with the following fields:
//  - name - string identifier
//  - adminOnly - set to true if only system admins should see this message
//  - icon - the image to display for the notice icon
//  - title - JSX node to display for the notice title
//  - body - JSX node to display for the notice body
//  - allowForget - boolean to allow forget the notice
//  - show - function that check if we need to show the notice
//
// Order is important! The notices at the top are shown first.

const notices: Notice[] = [
];

export default notices;
