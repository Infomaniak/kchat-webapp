// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Servers} from 'utils/constants';

export function setBadges(serverId: string, badges: number) {
    return {
        type: Servers.BADGE_UPDATED,
        data: {
            serverId,
            badges,
        },
    };
}

export function changeStatus(serverId: string, status: string) {
    return {
        type: Servers.STATUS_UPDATED,
        data: {
            serverId,
            status,
        },
    };
}
