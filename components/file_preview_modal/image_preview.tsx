// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {clamp} from 'lodash';

import {ZoomValue} from 'components/file_preview_modal/file_preview_modal_image_controls/file_preview_modal_image_controls';
import {LinkInfo} from 'components/file_preview_modal/types';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';
import {FileInfo} from '@mattermost/types/files';

import './image_preview.scss';

const SCROLL_SENSITIVITY = 0.003;
const MAX_SCALE = 5;
const MIN_SCALE = 1;

let zoomExport: number;
const minZoomExport = MIN_SCALE;

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
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({offsetX: 0, offsetY: 0});
    const imgRef = useRef<HTMLImageElement>(null);
    const scale = useRef(1);
    const isMouseDown = useRef(false);
    const touch = useRef({touchX: 0, touchY: 0});

    const imageWidth = imgRef.current?.width || 1;
    const imageHeight = imgRef.current?.height || 1;
    const containerWidth = imgRef.current?.parentElement?.parentElement?.clientWidth || window.innerWidth;
    const containerHeight = imgRef.current?.parentElement?.parentElement?.clientHeight || window.innerHeight;
    const maxContainerScale = getMaxContainerScale(imageWidth, imageHeight, containerWidth, containerHeight);
    const imageOverflows = scale.current > maxContainerScale;

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
        switch (toolbarZoom) {
        case 'A':
            scale.current = MIN_SCALE;
            break;
        case 'W':
            scale.current = clamp(containerWidth / imageWidth, MIN_SCALE, MAX_SCALE);
            break;
        case 'H':
            scale.current = clamp(containerHeight / imageHeight, MIN_SCALE, MAX_SCALE);
            break;
        default:
            scale.current = toolbarZoom;
            break;
        }
    }

    const handleWheel = (event: React.WheelEvent) => {
        event.persist();
        const {deltaY} = event;
        if (!dragging) {
            scale.current = clamp(scale.current + (deltaY * SCROLL_SENSITIVITY * -1), MIN_SCALE, MAX_SCALE);
            const {offsetX, offsetY} = offset;
            const {clampedOffsetX, clampedOffsetY} = clampOffset(offsetX, offsetY);
            setOffset({offsetX: clampedOffsetX, offsetY: clampedOffsetY});
            setToolbarZoom(scale.current === MIN_SCALE ? 'A' : scale.current);
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!dragging || scale.current === MIN_SCALE) {
            return;
        }
        const {touchX, touchY} = touch.current;
        const {clientX, clientY} = event;
        const {offsetX, offsetY} = offset;
        const {clampedOffsetX, clampedOffsetY} = clampOffset(offsetX + (clientX - touchX), offsetY + (clientY - touchY));
        setOffset({offsetX: clampedOffsetX, offsetY: clampedOffsetY});
        touch.current = {touchX: clientX, touchY: clientY};
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

    const isExternalFile = !fileInfo.id;
    let fileUrl = getFileDownloadUrl(fileInfo.id);
    let previewUrl = fileInfo.has_preview_image ? getFilePreviewUrl(fileInfo.id) : fileUrl;
    if (isExternalFile) {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    }

    const {offsetX, offsetY} = offset;
    const {clampedOffsetX, clampedOffsetY} = clampOffset(offsetX, offsetY);
    const containerStyle = {
        transform: `
            translate(${clampedOffsetX}px, ${clampedOffsetY}px)
            scale(${scale.current})
        `,
    };

    let cursorType = 'normal';
    if (imageOverflows) {
        cursorType = dragging ? 'dragging' : 'hover';
    }

    zoomExport = scale.current;

    return (
        <div style={containerStyle}>
            <img
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                ref={imgRef}
                src={previewUrl}
                className={`image_preview image_preview__${cursorType} ${imageOverflows ? 'image_preview__fullscreen' : ''}`}
            />
        </div>
    );
}

export {zoomExport, minZoomExport};
