// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */

import React from 'react';

import {Client4} from 'mattermost-redux/client';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import type {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import KDriveIcon from 'components/widgets/icons/kdrive_icon';

import {ActionTypes} from 'utils/constants';
import {t} from 'utils/i18n';
import {generateId} from 'utils/utils';

// const fileInfo = {
// id: string;
// user_id: string;
// create_at: number;
// update_at: number;
// delete_at: number;
// name: file.name,
// extension: string;
// size: file.size,
// mime_type: file.mimetype,
// width: number;
// height: number;
// has_preview_image: boolean;
// clientId,
// post_id?: string;
// mini_preview?: string;
// archived: boolean;
// link?: string;
// };

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

        // handle medium
        const color = theme.ikType === 'dark' ? 'dark' : 'light';
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement &
        { open: (mode: string, theme: string, fileName?: string) => Promise<{ driveId: number; elementId: number; name: string }> };

        driveModule.open('save-to-drive', color, fileName).
            then((data: { driveId: number; elementId: number; name: string }) => Client4.uploadToKdrive(fileId, data.driveId, data.elementId, data.name)).
            catch((error: string) => console.warn(error));

        return {data: true};
    };
}

export function selectFileFromKdrive(
    channelId: string,
    rootId: string,
    onUpload: Function,
    uploadStartHandler: Function,
    stateAdd: Function,
    stateRemove: Function,
    handleInputChange: Function,
    message: string,
    caretPosition: number,
) {
    return async (_: DispatchFunc, getState: GetStateFunc) => {
        const theme = getTheme(getState());

        // handle medium
        const color = theme.ikType === 'dark' ? 'dark' : 'light';
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement &
        { open: (mode: string, theme: string) => Promise<IDriveSelectionOutput> };

        driveModule.open('select-from-drive-mail', color).
            then((data: IDriveSelectionOutput) => {
                console.log(data);
                data.attachments.forEach(async (file) => {
                    const clientId = generateId();
                    const dummyRequest = stateAdd(clientId, file.name, file.type);
                    const fileInfo = {
                        name: file.name,
                        size: file.size,
                        mime_type: file.mimetype,
                        clientId,
                    };
                    dummyRequest.onProgress(fileInfo);
                    uploadStartHandler([clientId], channelId);
                    try {
                        const {file_infos, client_ids} = await Client4.downloadFromKdrive(channelId, file.driveId, file.id, clientId);
                        onUpload(file_infos, client_ids, channelId, rootId);
                        stateRemove(clientId);
                    } catch (error) {
                        console.warn(error);
                    }
                });
                data.shareAttachments.forEach((share) => {
                    const newMessage = message.slice(0, caretPosition) + share.url + message.slice(caretPosition);
                    handleInputChange({target: {value: newMessage}});
                });
            }).
            catch((error: string) => console.warn(error));

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
export function registerInternalKdrivePlugin() {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'FileUploadMethod',
            data: {
                id: 'kdrive',
                pluginId: 'kdrive',
                text: t('kdrive.upload'),
                customArgs: [
                    'onFileUpload',
                    'onUploadStart',
                    'addDummyRequest',
                    'removeDummyRequest',
                    'channelId',
                    'rootId',
                    'handleDriveSharelink',
                    'message',
                    'caretPosition',
                ],
                action: (
                    onFileUpload: Function,
                    onUploadStart: Function,
                    stateAdd: Function,
                    stateRemove: Function,
                    channelId: string,
                    rootId: string,
                    handleDriveSharelink: Function,
                    message: string,
                    caretPosition: number,
                ) => {
                    dispatch(selectFileFromKdrive(
                        channelId,
                        rootId,
                        onFileUpload,
                        onUploadStart,
                        stateAdd,
                        stateRemove,
                        handleDriveSharelink,
                        message,
                        caretPosition,
                    ));
                },
                icon: <KDriveIcon/>,
            },
        });
    };
}
