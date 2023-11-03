// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FileTypes} from 'utils/constants';

import type {FileInfo} from '@mattermost/types/files';
import type {Post} from '@mattermost/types/posts';

import type {ZoomValue} from '../file_preview_modal_image_controls/file_preview_modal_image_controls';
import FilePreviewModalImageControls from '../file_preview_modal_image_controls/file_preview_modal_image_controls';
import FilePreviewModalInfo from '../file_preview_modal_info/file_preview_modal_info';
import FilePreviewModalMainActions from '../file_preview_modal_main_actions/file_preview_modal_main_actions';
import FilePreviewModalMainNav from '../file_preview_modal_main_nav/file_preview_modal_main_nav';
import type {LinkInfo} from '../types';

import './file_preview_modal_header.scss';

interface Props {
    isMobileView: boolean;
    fileIndex: number;
    fileInfo: FileInfo | LinkInfo;
    totalFiles: number;
    filename: string;
    post: Post;
    fileURL: string;
    showPublicLink?: boolean;
    enablePublicLink: boolean;
    canDownloadFiles: boolean;
    canCopyContent: boolean;
    isExternalFile: boolean;
    fileType: string;
    toolbarZoom: ZoomValue;
    setToolbarZoom: (toolbarZoom: ZoomValue) => void;
    handlePrev: () => void;
    handleNext: () => void;
    handleModalClose: () => void;
    content: string;
}

const FilePreviewModalHeader: React.FC<Props> = ({post, totalFiles, fileIndex, toolbarZoom, setToolbarZoom, fileType, ...actionProps}: Props) => {
    let mainActions = (<div/>);
    if (totalFiles > 1) {
        mainActions = (
            <FilePreviewModalMainNav
                totalFiles={totalFiles}
                fileIndex={fileIndex}
                handlePrev={actionProps.handlePrev}
                handleNext={actionProps.handleNext}
            />
        );
    }
    let imageControls;
    if (fileType === FileTypes.IMAGE || fileType === FileTypes.SVG) {
        imageControls = (
            <FilePreviewModalImageControls
                toolbarZoom={toolbarZoom}
                setToolbarZoom={setToolbarZoom}
            />
        );
    }
    const actions = (
        <FilePreviewModalMainActions
            {...actionProps}
            showOnlyClose={actionProps.isMobileView}
            usedInside='Header'
        />);
    return (
        <>
            <div className='file-preview-modal-header'>
                {actionProps.isMobileView && actions}
                {!actionProps.isMobileView &&
                <FilePreviewModalInfo
                    showFileName={true}
                    post={post}
                    filename={actionProps.filename}
                />
                }
                {mainActions}
                {!actionProps.isMobileView && actions}
            </div>
            {imageControls}
        </>
    );
};

export default memo(FilePreviewModalHeader);

