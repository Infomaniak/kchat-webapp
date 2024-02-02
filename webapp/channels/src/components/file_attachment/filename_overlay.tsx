// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {FileInfo} from '@mattermost/types/files';

import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import ExternalLink from 'components/external_link';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import AttachmentIcon from 'components/widgets/icons/attachment_icon';
import KDriveIcon from 'components/widgets/icons/kdrive_icon';

import {trimFilename} from 'utils/file_utils';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';
import {localizeMessage} from 'utils/utils';

type Props = {

    /*
     * File detailed information
     */
    fileInfo: FileInfo;

    /*
     * Handler for when the thumbnail is clicked passed the index above
     */
    handleImageClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;

    /*
     * Handler for saving image to kdrive.
     */
    handleKDriveSave?: (fileId: string, fileName: string) => void;

    /*
     * Display in compact format
     */
    compactDisplay?: boolean;

    /*
     * If it should display link to download on file name
     */
    canDownload?: boolean;

    /*
     * Optional children like download icon
     */
    children?: React.ReactNode;

    /*
     * Optional class like for icon
     */
    iconClass?: string;
}

export default class FilenameOverlay extends React.PureComponent<Props> {
    render() {
        const {
            canDownload,
            children,
            compactDisplay,
            fileInfo,
            handleImageClick,
            handleKDriveSave,
            iconClass,
        } = this.props;

        const fileName = fileInfo.name;
        const trimmedFilename = trimFilename(fileName);

        let filenameOverlay;
        if (compactDisplay) {
            filenameOverlay = (
                <OverlayTrigger
                    delayShow={1000}
                    placement='top'
                    overlay={<Tooltip id='file-name__tooltip'>{fileName}</Tooltip>}
                >
                    <a
                        id='file-attachment-link'
                        href='#'
                        onClick={handleImageClick}
                        className='post-image__name'
                        rel='noopener noreferrer'
                    >
                        <AttachmentIcon className='icon'/>
                        {trimmedFilename}
                    </a>
                </OverlayTrigger>
            );
        } else if (canDownload) {
            filenameOverlay = (
                <div className={iconClass || 'post-image__name'}>
                    <OverlayTrigger
                        delayShow={1000}
                        placement='top'
                        overlay={
                            <Tooltip id='file-name__tooltip'>
                                {localizeMessage('view_image_popover.download', 'Download')}
                            </Tooltip>
                        }
                    >
                        <>
                            {(!isDesktopApp() || isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '2.4.0')) && (
                                <OverlayTrigger
                                    delayShow={200}
                                    placement='top'
                                    overlay={
                                        <Tooltip id='file-name__tooltip'>
                                            {localizeMessage('kdrive.save', 'Save file to kDrive')}
                                        </Tooltip>
                                    }
                                >
                                    <span className='file-kdrive__icon--wrapper'>
                                        <KDriveIcon
                                            onClick={() => handleKDriveSave?.(fileInfo.id, fileName)}
                                            className='icon file-kdrive__icon'
                                        />
                                    </span>
                                </OverlayTrigger>
                            )}
                            <ExternalLink
                                href={getFileDownloadUrl(fileInfo.id)}
                                aria-label={localizeMessage('view_image_popover.download', 'Download').toLowerCase()}
                                download={fileName}
                                location='filename_overlay'
                            >
                                {children || trimmedFilename}
                            </ExternalLink>
                        </>
                    </OverlayTrigger>
                </div>
            );
        } else {
            filenameOverlay = (
                <span className='post-image__name'>
                    {trimmedFilename}
                </span>
            );
        }

        return (filenameOverlay);
    }
}
