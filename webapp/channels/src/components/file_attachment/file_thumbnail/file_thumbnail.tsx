// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useRef, useState} from 'react';

import type {FileInfo} from '@mattermost/types/files';

import {getFileThumbnailUrl, getFileUrl} from 'mattermost-redux/utils/file_utils';

import type {FilePreviewInfo} from 'components/file_preview/file_preview';

import Constants, {FileTypes} from 'utils/constants';
import {getFileTypeFromMime} from 'utils/file_utils';
import {
    getFileType,
    getIconClassName,
    isGIFImage,
} from 'utils/utils';

type FilePreviewInfoLimited = Pick<FilePreviewInfo, 'clientId' | 'name' | 'percent' | 'type'>;

type Props = {
    enableSVGs: boolean;
    fileInfo: FileInfo | FilePreviewInfo | FilePreviewInfoLimited;
    disablePreview?: boolean;
};

const FileThumbnail = ({
    fileInfo,
    enableSVGs,
    disablePreview,
}: Props) => {
    const {id, extension, has_preview_image: hasPreviewImage, width = 0, height = 0} = (fileInfo as FileInfo);
    const mimeType = (fileInfo as FileInfo).mime_type || (fileInfo as FilePreviewInfo | FilePreviewInfoLimited).type;
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current && extension && isGIFImage(extension) && hasPreviewImage && typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver((entries) => {
                setIsVisible(entries[0]?.isIntersecting ?? false);
            });
            observer.observe(ref.current);
            return () => observer.disconnect();
        }
        return undefined;
    }, [extension, hasPreviewImage]);

    let type = FileTypes.OTHER;
    if (extension) {
        type = getFileType(extension);
    } else if (mimeType) {
        type = getFileTypeFromMime(mimeType);
    }

    if (id && !disablePreview) {
        if (type === FileTypes.IMAGE) {
            let className = 'post-image';

            if (width < Constants.THUMBNAIL_WIDTH && height < Constants.THUMBNAIL_HEIGHT) {
                className += ' small';
            } else {
                className += ' normal';
            }

            let displayUrl = getFileThumbnailUrl(id);
            if (extension && isGIFImage(extension)) {
                if (hasPreviewImage) {
                    displayUrl = isVisible ? getFileUrl(id) : getFileThumbnailUrl(id);
                } else {
                    displayUrl = getFileUrl(id);
                }
            }

            return (
                <div
                    ref={ref}
                    className={className}
                    style={{
                        backgroundImage: `url(${displayUrl})`,
                        backgroundSize: 'cover',
                    }}
                />
            );
        } else if (extension === FileTypes.SVG && enableSVGs) {
            return (
                <img
                    alt={'file thumbnail image'}
                    className='post-image normal'
                    src={getFileUrl(id)}
                />
            );
        }
    }

    return <div className={'file-icon ' + getIconClassName(type)}/>;
};

export default memo(FileThumbnail);
