// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import type {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {KdriveActionTypes} from 'utils/constants';

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
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement;
        driveModule.open('save-to-drive', theme, fileName).
            then((data: { driveId: number; elementId: number; name: string }) => {}).
            catch((error) => console.warn(error));

        return {data: true};
    };
}

export function importFileFromKdrive() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const theme = getTheme(getState());
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement;
        driveModule.open('select-from-drive-mail', theme).
            then((data: IDriveSelectionOutput) => console.log(data)).
            catch((error) => console.warn(error));

        return {data: true};
    };
}
