// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useMemo, useEffect, useState} from 'react';
import {clamp} from 'lodash';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import './image_preview.scss';
import {FileInfo} from '@mattermost/types/files';

import {ZoomValue} from './file_preview_modal_image_controls/file_preview_modal_image_controls';
import {LinkInfo} from './types';

const HORIZONTAL_PADDING = 48;
const VERTICAL_PADDING = 168;

const SCROLL_SENSITIVITY = 0.003;
const MAX_ZOOM = 5;

let zoom: number;
let minZoom: number;

interface Props {
    fileInfo: FileInfo & LinkInfo;
    toolbarZoom: ZoomValue;
    setToolbarZoom: (toolbarZoom: ZoomValue) => void;
}

// Utils
const getWindowDimensions = () => {
    const maxWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - HORIZONTAL_PADDING;
    const maxHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - VERTICAL_PADDING;
    return {maxWidth, maxHeight};
};

const fitCanvas = (width: number, height: number) => {
    // Calculate maximum scale for canvas to fit in viewport
    const {maxWidth, maxHeight} = getWindowDimensions();
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;

    return Math.round(Math.min(scaleX, scaleY) * 100) / 100;
};

export default function ImagePreview({fileInfo, toolbarZoom, setToolbarZoom}: Props) {
    const background = useMemo(() => new Image(), []);
    const {width, height} = background;
    const containerScale = fitCanvas(width, height);

    minZoom = Math.min(containerScale, 1);
    const maxCanvasZoom = containerScale;

    let isFullscreen = {horizontal: false, vertical: false};
    let cursorType = 'normal';

    // Set the zoom given by the toolbar dropdown
    switch (toolbarZoom) {
    case 'A':
        zoom = minZoom;
        break;
    case 'W':
        zoom = getWindowDimensions().maxWidth / width;
        break;
    case 'H':
        zoom = getWindowDimensions().maxHeight / height;
        break;
    default:
        zoom = toolbarZoom;
        break;
    }

    const [offset, setOffset] = useState({x: 0, y: 0});
    const [dragging, setDragging] = useState(false);
    const [, setIsReady] = useState(false);

    const touch = useRef({x: 0, y: 0});
    const canvasBorder = useRef({w: 0, h: 0});
    const isMouseDown = useRef(false);
    const containerRef = useRef(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const clampOffset = (x: number, y: number) => {
        // Clamps the offset to something that is inside canvas or window depending on zoom level
        const {w, h} = canvasBorder.current;
        const {horizontal, vertical} = isFullscreen;

        if (zoom <= maxCanvasZoom) {
            return {xPos: 0, yPos: 0};
        }
        return {
            xPos: horizontal ? clamp(x, w, -w) : 0,
            yPos: vertical ? clamp(y, h, -h) : 0,
        };
    };

    const handleWheel = (event: React.WheelEvent) => {
        event.persist();
        const {deltaY} = event;
        if (!dragging) {
            zoom = clamp(zoom + (deltaY * SCROLL_SENSITIVITY * -1), minZoom, MAX_ZOOM);
            setToolbarZoom(zoom === minZoom ? 'A' : zoom);
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!dragging) {
            return;
        }

        const {x, y} = touch.current;
        const {clientX, clientY} = event;
        const {xPos, yPos} = clampOffset(offset.x + (x - clientX), offset.y + (y - clientY));
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

    // Stop dragging if mouse left canvas
    const handleMouseLeave = () => setDragging(false);

    // Resume dragging if mouse stays clicked
    const handleMouseEnter = () => setDragging(isMouseDown.current);

    // Initialize canvas
    useEffect(() => {
        // Global mouseup event, otherwise canvas can stay stuck on mouse when leaving canvas while dragging
        window.addEventListener('mouseup', handleMouseUp);

        background.src = previewUrl;
        if (canvasRef.current) {
            background.onload = () => {
                // Initialize with the zoom at minimum.
                //zoom = minZoom; pretty sure that does fuck all, check tho
                setIsReady(true);
            };
        }

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');

        if (context) {
            // Improve smoothing quality
            context.imageSmoothingQuality = 'high';

            // Resize canvas to current zoom level
            canvasRef.current.width = width * zoom;
            canvasRef.current.height = height * zoom;

            // Update borders and clamp offset accordingly
            canvasBorder.current = {w: context.canvas.offsetLeft, h: context.canvas.offsetTop - 72 - 48};
            isFullscreen = {
                horizontal: canvasBorder.current.w <= 0,
                vertical: canvasBorder.current.h <= 0,
            };

            // Translate canvas to current offset
            const {xPos, yPos} = clampOffset(offset.x, offset.y);
            context.translate(-xPos, -yPos);

            context.drawImage(background, 0, 0, width * zoom, height * zoom);
        }
    }

    // Reset offset to center when unzoomed
    if (!(isFullscreen.horizontal || isFullscreen.vertical) && (offset.x !== 0 && offset.y !== 0)) {
        setOffset({x: 0, y: 0});
    }

    // Change cursor to dragging only if the image in the canvas is zoomed and draggable
    if (isFullscreen.horizontal || isFullscreen.vertical) {
        cursorType = dragging ? 'dragging' : 'hover';
    } else {
        cursorType = 'normal';
    }

    return (
        <div
            ref={containerRef}
            className={`image_preview_div__${zoom >= maxCanvasZoom ? 'fullscreen' : 'normal'}`}
        >
            <canvas
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onWheel={handleWheel}
                ref={canvasRef}
                className={`image_preview_canvas__${cursorType}`}
            />
        </div>
    );
}

export {zoom, minZoom};
