// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {CloudUsage, Limits} from '@mattermost/types/cloud';

import {FileSizes} from 'utils/file_utils';
import {limitThresholds, LimitTypes} from 'utils/limits';

import type {LimitSummary} from './useGetHighestThresholdCloudLimit';
import useGetHighestThresholdCloudLimit from './useGetHighestThresholdCloudLimit';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useMemo: (fn: () => LimitSummary) => fn(),
}));

jest.mock('@sentry/react', () => ({
    captureException: () => undefined,
}));

const zeroUsage: CloudUsage = {
    storage: 0,
    public_channels: 0,
    private_channels: 0,
    guests: 0,
    pending_guests: 0,
    members: 0,
    usageLoaded: true,
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
    custom_emojis: 0,
    incoming_webhooks: 0,
    outgoing_webhooks: 0,
    sidebar_categories: 0,
    scheduled_draft_custom_date: 0,
    reminder_custom_date: 0,
};

describe('useGetHighestThresholdCloudLimit', () => {
    const messageHistoryLimit = 10000;
    const filesLimit = FileSizes.Gigabyte;
    const okMessageUsage = Math.floor((limitThresholds.warn / 100) * messageHistoryLimit) - 1;
    const warnMessageUsage = Math.ceil((limitThresholds.warn / 100) * messageHistoryLimit) + 1;
    const tests = [
        {
            label: 'reports no highest limit if there are no limits',
            limits: {},
            usage: zeroUsage,
            expected: false,
        },
        {
            label: 'reports no highest limit if no limit exceeds the warn threshold',
            limits: {
                messages: {
                    history: messageHistoryLimit,
                },
            },
            usage: {
                ...zeroUsage,
                messages: {
                    ...zeroUsage.messages,
                    history: okMessageUsage,
                },
            },
            expected: false,
        },
        {
            label: 'reports a highest limit if one exceeds a threshold',
            limits: {
                messages: {
                    history: messageHistoryLimit,
                },
            },
            usage: {
                ...zeroUsage,
                messages: {
                    ...zeroUsage.messages,
                    history: warnMessageUsage,
                },
            },
            expected: {
                id: LimitTypes.messageHistory,
                limit: messageHistoryLimit,
                usage: warnMessageUsage,
            },
        },
        {
            label: 'messages beats files in tie',
            limits: {
                messages: {
                    history: messageHistoryLimit,
                },
                files: {
                    total_storage: filesLimit,
                },
            },
            usage: {
                ...zeroUsage,
                messages: {
                    ...zeroUsage.messages,
                    history: messageHistoryLimit,
                },
                files: {
                    ...zeroUsage.files,
                    totralStorage: filesLimit,
                },
            },
            expected: {
                id: LimitTypes.messageHistory,
                limit: messageHistoryLimit,
                usage: messageHistoryLimit,
            },
        },
        {
            label: 'files beats messages if higher',
            limits: {
                messages: {
                    history: messageHistoryLimit,
                },
                files: {
                    total_storage: filesLimit,
                },
            },
            usage: {
                ...zeroUsage,
                messages: {
                    ...zeroUsage.messages,
                    history: messageHistoryLimit,
                },
                files: {
                    ...zeroUsage.files,
                    totalStorage: filesLimit + FileSizes.Megabyte,
                },
            },
            expected: {
                id: LimitTypes.fileStorage,
                limit: filesLimit,
                usage: filesLimit + FileSizes.Megabyte,
            },
        },
    ];
    tests.forEach((t: typeof tests[0]) => {
        test(t.label, () => {
            const actual = useGetHighestThresholdCloudLimit(t.usage, t.limits as Limits);
            expect(t.expected).toEqual(actual);
        });
    });
});
