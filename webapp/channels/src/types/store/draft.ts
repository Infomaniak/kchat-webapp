// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {FileInfo} from '@mattermost/types/files';
import type {PostType, PostPriority} from '@mattermost/types/posts';

export type DraftInfo = {
    id: string;
    type: 'channel' | 'thread';
}

export type PostDraft = {

    /**
     * Every server draft has an id
     */
    id?: string;
    message: string;
    fileInfos: FileInfo[];
    uploadsInProgress: string[];
    props?: any;
    caretPosition?: number;
    postType?: PostType;
    channelId: string;
    rootId: string;
    createAt: number;
    updateAt: number;
    show?: boolean;

    /**
     * Every scheduled draft as a unix timestamp
     */
    timestamp?: number;
    metadata?: {
        priority?: {
            priority: PostPriority|'';
            requested_ack?: boolean;
            persistent_notifications?: boolean;
        };
    };
};
