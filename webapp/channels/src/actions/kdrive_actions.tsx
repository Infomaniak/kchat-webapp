// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {batchActions} from 'redux-batched-actions';

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

export function saveFileToKdrive(fileName: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const theme = getTheme(getState());
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement &
        { open: (mode: string, theme: string) => Promise<{ driveId: number; elementId: number; name: string }> };

        driveModule.open('save-to-drive', theme, fileName).
            then((data: { driveId: number; elementId: number; name: string }) => console.log(data)).
            catch((error: string) => console.warn(error));

        return {data: true};
    };
}

export function importFileFromKdrive() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const theme = getTheme(getState());
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement & { open: (mode: string, theme: string) => Promise<IDriveSelectionOutput> };

        driveModule.open('select-from-drive-mail', theme).
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
                action: () => dispatch(importFileFromKdrive()),
            },
        });

        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FileUploadMethod',
            data: {
                id: generateId(),
                pluginId: 'kdrive',
                text: 'Upload from kDrive',

                action: () => dispatch(importFileFromKdrive()),
                icon: <KDriveIcon/>,
            },
        });
    };
}
