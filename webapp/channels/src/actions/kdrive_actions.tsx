// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from 'mattermost-redux/client';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import type {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import KDriveIcon from 'components/widgets/icons/kdrive_icon';

import {ActionTypes, KdriveActionTypes} from 'utils/constants';
import {generateId} from 'utils/utils';

interface IDriveSelectionOutput {
    attachmentsSize: number;
    attachments: Array<{
        id: number;
        driveId: number;
        name: string;
        type: string;
        mimetype: string;
        size: number;
        url: string;
    }>;
    shareAttachments: Array<{
        id: number;
        driveId: number;
        name: string;
        type: string;
        mimetype: string;
        size: number;
        url: string;
    }>;
}

export function saveFileToKdrive(fileId: string, fileName: string) {
    return async (_: DispatchFunc, getState: GetStateFunc) => {
        const theme = getTheme(getState());

        // account for medium
        const color = theme.ikType === 'dark' ? 'dark' : 'light';
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement &
        { open: (mode: string, theme: string, fileName?: string) => Promise<{ driveId: number; elementId: number; name: string }> };

        driveModule.open('save-to-drive', color, fileName).
            then((data: { driveId: number; elementId: number; name: string }) => Client4.uploadToKdrive(fileId, data.driveId, data.elementId, data.name)).
            catch((error: string) => console.warn(error));

        return {data: true};
    };
}

export function selectFileFromKdrive() {
    return async (_: DispatchFunc, getState: GetStateFunc) => {
        const theme = getTheme(getState());

        // account for medium
        const color = theme.ikType === 'dark' ? 'dark' : 'light';
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement & { open: (mode: string, theme: string) => Promise<IDriveSelectionOutput> };

        driveModule.open('select-from-drive-mail', color).
            then((data: IDriveSelectionOutput) => console.log(data)).
            catch((error: string) => console.warn(error));

        return {data: true};
    };
}

export function registerInteralKdrivePlugin() {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FileWillUploadHook',
            data: {
                id: generateId(),
                pluginId: 'kdrive',
                action: (data: unknown) => console.log(data),
            },
        });

        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FileUploadMethod',
            data: {
                id: generateId(),
                pluginId: 'kdrive',
                text: 'Upload from kDrive',

                action: () => dispatch(selectFileFromKdrive()),
                icon: <KDriveIcon/>,
            },
        });

        return {data: true};
    };
}
