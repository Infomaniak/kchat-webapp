// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type ServerError = {
    type?: string;
    server_error_id?: string;
    stack?: string;
    message: string;
    intlId?: string; // IK: to translate the red announcement bar javascript error
    status_code?: number;
    error?: { code: string; description?: string };
    url?: string;
};
