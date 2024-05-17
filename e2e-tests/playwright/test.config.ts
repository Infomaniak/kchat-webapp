// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as dotenv from 'dotenv';

import {TestConfig} from '@e2e-types';

dotenv.config();

/**
 * Replace a domain that is before "staging-XXXXX" (and optionally a prefix)
 *      with another static value *replaceWith*
 * Example https://infomaniak.staging-74864.dev.infomaniak.ch replaceWith "kchat-testing-1-preprod"
 *      -> https://kchat-testing-1-preprod.staging-74864.dev.infomaniak.ch
 */
const replaceDomain = (url: string, replaceWith: string, prefix?: string): string => {
    const prefixRe = new RegExp(`(?<=https://).+(?=${prefix ? `\\.${prefix}` : ''}\\.staging-\\d+)`);
    return prefixRe.test(url) ? url.replace(prefixRe, replaceWith) : url;
}

const baseURL = replaceDomain(
    process.env.PW_BASE_URL || 'https://local.preprod.dev.infomaniak.ch:9005',
    process.env.PW_KCHAT_TEAM_PREFIX || 'infomaniak',
    'kchat',
);
const authBaseURL = replaceDomain(baseURL, 'login');
const adminEmail = process.env.PW_ADMIN_EMAIL || 'sysadmin@sample.mattermost.com';


// All process.env should be defined here
const config: TestConfig = {
    baseURL,
    authBaseURL,

    adminEmail,
    adminUsername: process.env.PW_ADMIN_USERNAME || adminEmail,
    adminPassword: process.env.PW_ADMIN_PASSWORD || 'Sys@dmin-sample1',
        ensurePluginsInstalled:
        typeof process.env?.PW_ENSURE_PLUGINS_INSTALLED === 'string'
            ? process.env.PW_ENSURE_PLUGINS_INSTALLED.split(',').filter((plugin) => Boolean(plugin))
            : [],
    haClusterEnabled: parseBool(process.env.PW_HA_CLUSTER_ENABLED, false),
    haClusterNodeCount: parseNumber(process.env.PW_HA_CLUSTER_NODE_COUNT, 2),
    haClusterName: process.env.PW_HA_CLUSTER_NAME || 'mm_dev_cluster',
    pushNotificationServer: process.env.PW_PUSH_NOTIFICATION_SERVER || 'https://push-test.mattermost.com',
    resetBeforeTest: parseBool(process.env.PW_RESET_BEFORE_TEST, false),

    // CI
    isCI: !!process.env.CI,

    // Playwright
    headless: parseBool(process.env.PW_HEADLESS, true),
    slowMo: parseNumber(process.env.PW_SLOWMO, 0),
    workers: parseNumber(process.env.PW_WORKERS, 1),

    // Visual tests
    snapshotEnabled: parseBool(process.env.PW_SNAPSHOT_ENABLE, false),
    percyEnabled: parseBool(process.env.PW_PERCY_ENABLE, false),
    percyToken: process.env.PERCY_TOKEN,
};

function parseBool(actualValue: string | undefined, defaultValue: boolean) {
    return actualValue ? actualValue === 'true' : defaultValue;
}

function parseNumber(actualValue: string | undefined, defaultValue: number) {
    return actualValue ? parseInt(actualValue, 10) : defaultValue;
}

export default config;
