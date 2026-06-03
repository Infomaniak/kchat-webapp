// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Limits, CloudUsage} from '@mattermost/types/cloud';

interface LimitsRedux {
    limitsLoaded: boolean;
    limits: Limits;
}

export function makeEmptyLimits(): LimitsRedux {
    return {
        limitsLoaded: true,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        limits: {},
    };
}

export function makeEmptyUsage(): CloudUsage {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
    return {
        files: {
            totalStorage: 0,
            totalStorageLoaded: true,
        },
        messages: {
            history: 0,
            historyLoaded: true,
        },
        teams: {
            active: 0,
            cloudArchived: 0,
            teamsLoaded: true,
        },
    };
}
