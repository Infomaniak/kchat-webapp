// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare const COMMIT_HASH: string;
declare const GIT_RELEASE: string;

interface Window {
    WC_TOKEN?: string | null;
    authManager: {
        logout: () => Promise<void>;
        resetToken?: () => void;
        tokenRequest: () => Promise<void>;
    };
}

declare namespace JSX {
    interface IntrinsicElements {
        'wc-contact-sheet': unknown;
        'wc-ksuite-pro-upgrade-banner': any;
        'wc-ksuite-pro-upgrade-dialog': any;
        'wc-ksuite-pro-upgrade-button': any;
        'wc-ksuite-pro-upgrade-tag': any;
        'wc-mail-attachment': any;
        'wc-ksuite-pro-upgrade-compact-tag': any;
        'wc-icon': any;
    }
}

