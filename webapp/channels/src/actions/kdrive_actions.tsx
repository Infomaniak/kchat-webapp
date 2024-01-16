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

export function selectFileFromKdrive(channelId: string) {
    return async (_: DispatchFunc, getState: GetStateFunc) => {
        const theme = getTheme(getState());

        // account for medium
        const color = theme.ikType === 'dark' ? 'dark' : 'light';
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement & { open: (mode: string, theme: string) => Promise<IDriveSelectionOutput> };

        driveModule.open('select-from-drive-mail', color).
            then((data: IDriveSelectionOutput) => {
                data.attachments.forEach(async (file) => {
                    await Client4.downloadFromKdrive(channelId, file.driveId, file.id);
                });
            }).
            catch((error: string) => console.warn(error));

        return {data: true};
    };
}

/**
 * Idk what this is used for yet but without it FileUploadMethod doesn't work.
 *
 * @returns {void}
 */
export function registerInteralKdriveHook() {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FileWillUploadHook',
            data: {
                id: generateId(),
                pluginId: 'kdrive',
            },
        });

        return {data: true};
    };
}

/**
 * This action is called every channel switch in {@code ChannelView} to register a kdrive upload plugin.
 * The plugin needs to be reregistered every channel switch because it needs to bind the channel id to the
 * plugin action. The old one needs to be manually removed otherwise it adds a duplicate.
 *
 * @param channelId - Current channel id.
 * @returns {void}
 */
export function registerInternalKdrivePlugin(channelId: string) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: ActionTypes.REMOVED_PLUGIN_COMPONENT,
            name: 'FileUploadMethod',
            id: 'kdrive',
        });
        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FileUploadMethod',
            data: {
                id: 'kdrive',
                pluginId: 'kdrive',
                text: 'Upload from kDrive',

                action: () => dispatch(selectFileFromKdrive(channelId)),
                icon: <KDriveIcon/>,
            },
        });
    };
}
