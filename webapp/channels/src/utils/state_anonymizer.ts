// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from 'types/store';

export const anonymizeState = (state: GlobalState): GlobalState => {
    const clone = JSON.parse(JSON.stringify(state));

    if (clone.entities?.posts?.posts) {
        for (const postId in clone.entities.posts.posts) {
            if (Object.prototype.hasOwnProperty.call(clone.entities.posts.posts, postId)) {
                const post = clone.entities.posts.posts[postId];
                post.message = '[PRIVATE]';
                post.file_ids = post.file_ids ? '[PRIVATE]' : undefined;
                post.props = post.props ? '[PRIVATE]' : undefined;
            }
        }
    }

    if (clone.entities?.users?.profiles) {
        for (const userId in clone.entities.users.profiles) {
            if (Object.prototype.hasOwnProperty.call(clone.entities.users.profiles, userId)) {
                const user = clone.entities.users.profiles[userId];
                user.email = '[PRIVATE]';
                user.username = '[PRIVATE]';
                user.first_name = '[PRIVATE]';
                user.last_name = '[PRIVATE]';
                user.nickname = '[PRIVATE]';
                user.position = '[PRIVATE]';
                user.props = user.props ? '[PRIVATE]' : undefined;
            }
        }
    }

    if (clone.entities?.general?.config) {
        const sensitiveConfigKeys = [
            'SqlSettings.DataSource',
            'SqlSettings.AtRestEncryptKey',
            'ServiceSettings.GfycatApiKey',
            'ServiceSettings.GfycatApiSecret',
            'ServiceSettings.GoogleDeveloperKey',
            'ServiceSettings.MailPassword',
            'ServiceSettings.PublicLinkSalt',
            'ServiceSettings.PrivateLinkSalt',
            'ServiceSettings.InviteSalt',
            'ServiceSettings.PasswordResetSalt',
            'ServiceSettings.AWSSecretAccessKey',
            'ServiceSettings.AWSAccessKeyId',
            'ServiceSettings.SMTPPassword',
            'ServiceSettings.SMTPUsername',
        ];

        for (const key of sensitiveConfigKeys) {
            if (clone.entities.general.config[key]) {
                clone.entities.general.config[key] = '[PRIVATE]';
            }
        }
    }

    if (clone.entities?.files?.files) {
        for (const fileId in clone.entities.files.files) {
            if (Object.prototype.hasOwnProperty.call(clone.entities.files.files, fileId)) {
                const file = clone.entities.files.files[fileId];
                file.url = '[PRIVATE]';
                file.thumbnail_url = '[PRIVATE]';
                file.mini_preview = '[PRIVATE]';
            }
        }
    }

    if (clone.entities?.admin) {
        clone.entities.admin.logs = '[PRIVATE]';
        clone.entities.admin.audits = '[PRIVATE]';
    }

    return clone;
};

export const dumpReduxState = (state: GlobalState): void => {
    const safeState = anonymizeState(state);
    const blob = new Blob([JSON.stringify(safeState, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'redux-state-anonymized.json';
    a.click();
    URL.revokeObjectURL(url);
};
