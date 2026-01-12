// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Team} from '@mattermost/types/teams';

import type {ServerStatus} from 'utils/constants';

export type ServersStatusKeys = keyof typeof ServerStatus

export type Server = Team & {
    badges: number;
    status: (typeof ServerStatus)[ServersStatusKeys];
}
