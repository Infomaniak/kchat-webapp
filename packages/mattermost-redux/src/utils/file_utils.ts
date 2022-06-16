// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Files, General} from '../constants';
import {Client4} from 'mattermost-redux/client';
import {FileInfo} from '@mattermost/types/files';
import {isDesktopApp} from 'utils/user_agent';
import {buildQueryString} from 'packages/client/src/helpers';

const mimeDB = require('mime-db');

export function getFormattedFileSize(file: FileInfo): string {
    const bytes = file.size;
    const fileSizes = [
        ['TB', 1024 * 1024 * 1024 * 1024],
        ['GB', 1024 * 1024 * 1024],
        ['MB', 1024 * 1024],
        ['KB', 1024],
    ];
    const size = fileSizes.find((unitAndMinBytes) => {
        const minBytes = unitAndMinBytes[1];
        return bytes > minBytes;
    });

    if (size) {
        return `${Math.floor(bytes / (size[1] as any))} ${size[0]}`;
    }

    return `${bytes} B`;
}

export function getFileType(file: FileInfo): string {
    if (!file || !file.extension) {
        return 'other';
    }

    const fileExt = file.extension.toLowerCase();
    const fileTypes = [
        'image',
        'code',
        'pdf',
        'video',
        'audio',
        'spreadsheet',
        'text',
        'word',
        'presentation',
        'patch',
    ];
    return fileTypes.find((fileType) => {
        const constForFileTypeExtList = `${fileType}_types`.toUpperCase();
        const fileTypeExts = Files[constForFileTypeExtList];
        return fileTypeExts.indexOf(fileExt) > -1;
    }) || 'other';
}

let extToMime: Record<string, string>;
function buildExtToMime() {
    extToMime = {};
    Object.keys(mimeDB).forEach((key) => {
        const mime = mimeDB[key];
        if (mime.extensions) {
            mime.extensions.forEach((ext: string) => {
                extToMime[ext] = key;
            });
        }
    });
}

export function lookupMimeType(filename: string): string {
    if (!extToMime) {
        buildExtToMime();
    }

    const ext = filename.split('.').pop()!.toLowerCase();
    return extToMime[ext] || 'application/octet-stream';
}

export function getFileUrl(fileId: string): string {
    const params: any = {};
    params.download = 1;

    if (isDesktopApp() && Client4.getToken()) {
        params.access_token = Client4.getToken();
    }
    return `${Client4.getFileRoute(fileId)}${buildQueryString(params)}`;
}

export function getFileDownloadUrl(fileId: string): string {
    const params: any = {};
    params.download = 1;

    if (isDesktopApp() && Client4.getToken()) {
        params.access_token = Client4.getToken();
    }
    return `${Client4.getFileRoute(fileId)}${buildQueryString(params)}`;
}

export function getFileThumbnailUrl(fileId: string): string {
    const params: any = {};
    if (isDesktopApp() && Client4.getToken()) {
        params.access_token = Client4.getToken();
    }
    return `${Client4.getFileRoute(fileId)}/thumbnail${buildQueryString(params)}`;
}

export function getFilePreviewUrl(fileId: string): string {
    const params: any = {};
    if (isDesktopApp() && Client4.getToken()) {
        params.access_token = Client4.getToken();
    }
    return `${Client4.getFileRoute(fileId)}/preview${buildQueryString(params)}`;
}

export function sortFileInfos(fileInfos: FileInfo[] = [], locale: string = General.DEFAULT_LOCALE): FileInfo[] {
    return fileInfos.sort((a, b) => {
        if (a.create_at !== b.create_at) {
            return a.create_at - b.create_at;
        }

        return a.name.localeCompare(b.name, locale, {numeric: true});
    });
}
