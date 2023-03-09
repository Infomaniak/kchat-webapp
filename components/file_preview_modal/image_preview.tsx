// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {clamp} from 'lodash';

import {ZoomValue} from 'components/file_preview_modal/file_preview_modal_image_controls/file_preview_modal_image_controls';
import {LinkInfo} from 'components/file_preview_modal/types';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';
import {FileInfo} from '@mattermost/types/files';

import './image_preview.scss';

const HORIZONTAL_PADDING = 48;
const VERTICAL_PADDING = 168;
const SCROLL_SENSITIVITY = 0.003;
const MAX_SCALE = 5;
const MIN_SCALE = 1;

let zoomExport: number;
let minZoomExport: number;

interface Props {
    fileInfo: FileInfo & LinkInfo;
    toolbarZoom: ZoomValue;
    setToolbarZoom: (toolbarZoom: ZoomValue) => void;
}

const getWindowDimensions = () => {
    const maxWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - HORIZONTAL_PADDING;
    const maxHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - VERTICAL_PADDING;
    return {maxWidth, maxHeight};
};

const fitImage = (width: number, height: number) => {
    const {maxWidth, maxHeight} = getWindowDimensions();
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    return Math.round(Math.min(scaleX, scaleY) * 100) / 100;
};

export default function ImagePreview({fileInfo, toolbarZoom, setToolbarZoom}: Props) {
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({x: 0, y: 0});

    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const scale = useRef(1);
    const isMouseDown = useRef(false);
    const touch = useRef({x: 0, y: 0});
    const imageBorder = useRef({w: 0, h: 0});

    const clampOffset = (x: number, y: number) => {
        const {w, h} = imageBorder.current;
        const {horizontal, vertical} = isFullscreen;

        if (scale.current <= maxZoom) {
            return {xPos: 0, yPos: 0};
        }

        return {
            xPos: horizontal ? clamp(x, w, -w) : 0,
            yPos: vertical ? clamp(y, h, -h) : 0,
        };
    };

    const maxZoom = fitImage(fileInfo.width, fileInfo.height);
    let isFullscreen = {horizontal: false, vertical: false};

    if (imgRef.current) {
        const {maxWidth, maxHeight} = getWindowDimensions();
        const {width, height} = imgRef.current;

        switch (toolbarZoom) {
        case 'A':
            scale.current = MIN_SCALE;
            break;
        case 'W':
            scale.current = clamp(getWindowDimensions().maxWidth / width, MIN_SCALE, MAX_SCALE);
            break;
        case 'H':
            scale.current = clamp(getWindowDimensions().maxHeight / height, MIN_SCALE, MAX_SCALE);
            break;
        default:
            scale.current = toolbarZoom;
            break;
        }

        imageBorder.current = {
            w: (maxWidth - (width * scale.current)) / 2,
            h: (maxHeight - (height * scale.current)) / 2,
        };
        isFullscreen = {
            horizontal: imageBorder.current.w <= 0,
            vertical: imageBorder.current.h <= 0,
        };
    }

    const isExternalFile = !fileInfo.id;

    let fileUrl;
    let previewUrl: string;
    if (isExternalFile) {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    } else {
        fileUrl = getFileDownloadUrl(fileInfo.id);
        previewUrl = fileInfo.has_preview_image ? getFilePreviewUrl(fileInfo.id) : fileUrl;
    }

    const handleWheel = (event: React.WheelEvent) => {
        event.persist();
        const {deltaY} = event;
        if (!dragging) {
            scale.current = clamp(scale.current + (deltaY * SCROLL_SENSITIVITY * -1), MIN_SCALE, MAX_SCALE);
            const {xPos, yPos} = clampOffset(offset.x, offset.y);
            setOffset({x: xPos, y: yPos});
            setToolbarZoom(scale.current === MIN_SCALE ? 'A' : scale.current);
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!dragging || scale.current === MIN_SCALE) {
            return;
        }
        const {x, y} = touch.current;
        const {clientX, clientY} = event;
        const {xPos, yPos} = clampOffset(offset.x + (clientX - x), offset.y + (clientY - y));
        setOffset({x: xPos, y: yPos});
        touch.current = {x: clientX, y: clientY};
    };

    const handleMouseDown = (event: React.MouseEvent) => {
        event.preventDefault();
        const {clientX, clientY} = event;
        touch.current = {x: clientX, y: clientY};
        isMouseDown.current = true;
        setDragging(true);
    };

    const handleMouseUp = () => {
        isMouseDown.current = false;
        setDragging(false);
    };

    zoomExport = scale.current;
    minZoomExport = MIN_SCALE;

    const {xPos, yPos} = clampOffset(offset.x, offset.y);
    const containerStyle = {
        transform: `
            translate(${xPos}px, ${yPos}px)
            scale(${scale.current})
        `,
    };

    let cursorType = 'normal';

    if (scale.current !== 1) {
        cursorType = dragging ? 'dragging' : 'hover';
    }

    return (
        <div
            ref={containerRef}
            style={containerStyle}
        >
            <img
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                ref={imgRef}
                src={previewUrl}
                className={`image_preview image_preview__${cursorType} ${isFullscreen.horizontal || isFullscreen.vertical ? 'image_preview__fullscreen' : ''}`}
            />
        </div>
    );
}

export {zoomExport, minZoomExport};
