// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */

import React from 'react';

import {Client4} from 'mattermost-redux/client';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import type {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import KDriveIcon from 'components/widgets/icons/kdrive_icon';

import {ActionTypes, KDriveActionTypes} from 'utils/constants';
import {generateId, localizeMessage} from 'utils/utils';

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

export function setKDriveToast(message?: string, link?: string) {
    return async (dispatch: DispatchFunc) => {
        if (!message) {
            dispatch({type: KDriveActionTypes.TOAST, toast: null});
            return;
        }

        dispatch({
            type: KDriveActionTypes.TOAST,
            toast: {
                message,
                props: {
                    link,
                },
            },
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));
        dispatch({type: KDriveActionTypes.TOAST, toast: null});
    };
}

export function saveFileToKdrive(fileId: string, fileName: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const theme = getTheme(getState());

        // handle medium
        const color = theme.ikType === 'dark' ? 'dark' : 'light';
        const driveModule = document.querySelector('module-kdrive-component') as HTMLElement &
        { open: (mode: string, theme: string, fileName?: string) => Promise<{ driveId: number; elementId: number; name: string }> };

        driveModule.open('save-to-drive', color, fileName).
            then(async (data: { driveId: number; elementId: number; name: string }) => {
                console.log(data);
                const res = await Client4.uploadToKdrive(fileId, data.driveId, data.elementId, data.name);

                if (!('error' in res)) {
                    // TODO use env for preprod
                    const link = `https://drive.infomaniak.com/app/drive/${data.driveId}/redirect/${data.elementId}`;
                    dispatch(setKDriveToast(localizeMessage('kdrive.uploadSuccess', 'Your file has been saved to kDrive'), link));
                }
            }).
            catch((error: string) => console.warn(error));

        return {data: true};
    };
}

export function selectFileFromKdrive(
    channelId: string,
    rootId: string,
    onUpload: Function,
    uploadStartHandler: (clientIds: string[], channelId: string) => void,
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
        { open: (mode: string, theme: string, limit: number/**in bytes*/) => Promise<IDriveSelectionOutput> };

        driveModule.open('select-from-drive-mail', color, 104900000).
            then((data: IDriveSelectionOutput) => {
                console.log(data);
                const reqs: Array<{
                    name: string;
                    size: number;
                    mime_type: string;
                    clientId: string;
                    driveId: number;
                    id: number;
                }> = [];
                const ids: string[] = [];
                data.attachments.forEach((file) => {
                    const clientId = generateId();
                    ids.push(clientId);
                    const dummyRequest = stateAdd(clientId, file.name, file.type);
                    const fileInfo = {
                        name: file.name,
                        size: file.size,
                        mime_type: file.mimetype,
                        clientId,
                    };
                    dummyRequest.onProgress(fileInfo);
                    reqs.push({
                        ...fileInfo,
                        driveId: file.driveId,
                        id: file.id,
                    });
                });
                uploadStartHandler(ids, channelId);
                reqs.forEach(async (req) => {
                    try {
                        const {file_infos, client_ids} = await Client4.downloadFromKdrive(channelId, req.driveId, req.id, req.clientId);
                        onUpload(file_infos, client_ids, channelId, rootId);
                        stateRemove(req.clientId);
                    } catch (error) {
                        console.warn(error);
                    }
                });
                let linksConcat = '';
                const messageStart = message.slice(0, caretPosition);
                const messageEnd = message.slice(caretPosition);
                data.shareAttachments.forEach((share, idx) => {
                    linksConcat += (idx > 0 ? '\n' : '') + share.url;
                });
                const newMessage = messageStart + linksConcat + messageEnd;
                handleInputChange({target: {value: newMessage}});
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
                text: localizeMessage('kdrive.upload', 'Upload from kDrive'),
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
                    onUploadStart: (clientIds: string[], channelId: string) => void,
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
