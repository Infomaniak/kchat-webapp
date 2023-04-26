// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import {clamp} from 'lodash';
import classNames from 'classnames';

import {ZoomValue} from 'components/file_preview_modal/file_preview_modal_image_controls/file_preview_modal_image_controls';
import {LinkInfo} from 'components/file_preview_modal/types';
import LoadingImagePreview from 'components/loading_image_preview';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';
import {FileInfo} from '@mattermost/types/files';

import './image_preview.scss';

const PADDING = 48;
const SCROLL_SENSITIVITY = 0.003;
const DEFAULT_MAX_SCALE = 5;
const DEFAULT_MIN_SCALE = 1;

let zoomExport: number;
let minZoomExport: number;

type Offset = {
    offsetX: number;
    offsetY: number;
};

type Touch = {
    touchX: number;
    touchY: number;
};

interface Props {
    fileInfo: FileInfo & LinkInfo;
    toolbarZoom: ZoomValue;
    setToolbarZoom: (toolbarZoom: ZoomValue) => void;
}

const getMaxContainerScale = (imageWidth: number, imageHeight: number, containerWidth: number, containerHeight: number) => {
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    return Math.round(Math.min(scaleX, scaleY) * 100) / 100;
};

export default function ImagePreview({fileInfo, toolbarZoom, setToolbarZoom}: Props) {
    const [loaded, setLoaded] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState<Offset>({offsetX: 0, offsetY: 0});
    const imgRef = useRef<HTMLImageElement>(null);
    const scale = useRef(1);
    const isMouseDown = useRef(false);
    const touch = useRef<Touch>({touchX: 0, touchY: 0});
    const maxScale = useRef(1);
    const minScale = useRef(1);

    const isExternalFile = !fileInfo.id;
    let fileUrl = getFileDownloadUrl(fileInfo.id);
    let previewUrl = fileInfo.has_preview_image ? getFilePreviewUrl(fileInfo.id) : fileUrl;
    if (isExternalFile) {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    }

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    useEffect(() => {
        setLoaded(false);
        setToolbarZoom('A');
    }, [previewUrl]);

    const imageWidth = imgRef.current?.width || 1;
    const imageHeight = imgRef.current?.height || 1;
    const containerWidth = imgRef.current?.parentElement?.parentElement?.clientWidth || window.innerWidth;
    const containerHeight = imgRef.current?.parentElement?.parentElement?.clientHeight || window.innerHeight;
    const maxContainerScale = getMaxContainerScale(imageWidth, imageHeight, containerWidth - PADDING, containerHeight - PADDING);
    minScale.current = Math.min(maxContainerScale, DEFAULT_MIN_SCALE);

    const clampOffset = (offsetX: number, offsetY: number) => {
        const overflowWidth = ((imageWidth * scale.current) - containerWidth) / 2;
        const overflowHeight = ((imageHeight * scale.current) - containerHeight) / 2;
        const isFullscreenHorizontaly = overflowWidth >= 0;
        const isFullscreenVerticaly = overflowHeight >= 0;

        return {
            clampedOffsetX: isFullscreenHorizontaly ? clamp(offsetX, -overflowWidth, overflowWidth) : 0,
            clampedOffsetY: isFullscreenVerticaly ? clamp(offsetY, -overflowHeight, overflowHeight) : 0,
        };
    };

    if (imgRef.current) {
        const imageRatio = Math.round(DEFAULT_MAX_SCALE * (imgRef.current.naturalWidth / imgRef.current.width) * 100) / 100;
        maxScale.current = Math.max(imageRatio, DEFAULT_MAX_SCALE);

        switch (toolbarZoom) {
        case 'A':
            scale.current = minScale.current;
            break;
        case 'W':
            scale.current = clamp(containerWidth / imageWidth, minScale.current, maxScale.current);
            break;
        case 'H':
            scale.current = clamp(containerHeight / imageHeight, minScale.current, maxScale.current);
            break;
        default:
            scale.current = toolbarZoom * (maxScale.current / DEFAULT_MAX_SCALE);
            break;
        }
    }

    const handleWheel = (event: React.WheelEvent) => {
        event.persist();
        const {deltaY} = event;
        if (!dragging) {
            scale.current = clamp(scale.current + (deltaY * -SCROLL_SENSITIVITY), minScale.current, maxScale.current);
            const {offsetX, offsetY} = offset;
            const {clampedOffsetX, clampedOffsetY} = clampOffset(offsetX, offsetY);
            setOffset({offsetX: clampedOffsetX, offsetY: clampedOffsetY});
            setToolbarZoom(scale.current === minScale.current ? 'A' : scale.current / (maxScale.current / DEFAULT_MAX_SCALE));
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!dragging || !imageOverflows) {
            return;
        }
        const {touchX, touchY} = touch.current;
        const {clientX, clientY} = event;
        const {offsetX, offsetY} = offset;
        const {clampedOffsetX, clampedOffsetY} = clampOffset(offsetX + (clientX - touchX), offsetY + (clientY - touchY));
        setOffset({offsetX: clampedOffsetX, offsetY: clampedOffsetY});
        touch.current = {touchX: clientX, touchY: clientY};
    };

    const handleMouseLeave = () => {
        if (dragging) {
            setDragging(false);
        }
    };

    const handleMouseEnter = () => {
        if (dragging !== isMouseDown.current) {
            setDragging(isMouseDown.current);
        }
    };

    const handleMouseDown = (event: React.MouseEvent) => {
        event.preventDefault();
        const {clientX, clientY} = event;
        touch.current = {touchX: clientX, touchY: clientY};
        isMouseDown.current = true;
        setDragging(true);
    };

    const handleMouseUp = () => {
        isMouseDown.current = false;
        setDragging(false);
    };

    const handleLoad = () => setLoaded(true);

    const {offsetX, offsetY} = offset;
    const {clampedOffsetX, clampedOffsetY} = clampOffset(offsetX, offsetY);
    const containerStyle = {
        transform: `
            translate(${clampedOffsetX}px, ${clampedOffsetY}px)
            scale(${scale.current})
        `,
    };

    const imageOverflows = scale.current > getMaxContainerScale(imageWidth, imageHeight, containerWidth, containerHeight);
    let cursorType = 'normal';
    if (imageOverflows) {
        cursorType = dragging ? 'dragging' : 'hover';
    }

    zoomExport = scale.current;
    minZoomExport = minScale.current;

    return (
        <div style={containerStyle}>
            {!loaded && <LoadingImagePreview/>}
            <img
                className={classNames(`image_preview image_preview__${cursorType}`, {
                    image_preview_loading: !loaded,
                    image_preview__fullscreen: imageOverflows,
                })}
                ref={imgRef}
                src={previewUrl}
                loading='lazy'
                onLoad={handleLoad}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onWheel={handleWheel}
            />
        </div>
    );
}

export {zoomExport, minZoomExport};
