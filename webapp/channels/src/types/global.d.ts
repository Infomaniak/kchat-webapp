// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare const COMMIT_HASH: string;
declare const GIT_RELEASE: string;
declare global {
    interface Window {
        webComponentsStore?: {
            currentAccount?: {
                is_partner?: boolean;
            };
            userStartConfig?: {
                is_staff?: boolean;
            };
        };
    }
}
export {};
