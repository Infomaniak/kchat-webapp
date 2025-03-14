// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ClientConfig, ClientLicense} from './config';

export type GeneralState = {
    config: Partial<ClientConfig> & {IsNewVersionCanaryOnly?: boolean;};
    firstAdminVisitMarketplaceStatus: boolean;
    firstAdminCompleteSetup: boolean;
    license: ClientLicense;
    serverVersion: string;
};

export type SystemSetting = {
    name: string;
    value: string;
};
