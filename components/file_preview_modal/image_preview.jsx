// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react-hooks/exhaustive-deps */

/*

to do (in no order):
- Zoom to where mouse is
- Spacebar toggles dragging?
- Add rotation?

doing (in order):

*/

import PropTypes from 'prop-types';
import React, {useRef, useMemo, useEffect, useState} from 'react';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import './image_preview.scss';

const HORIZONTAL_PADDING = 48;
const VERTICAL_PADDING = 168;

const SCROLL_SENSITIVITY = 0.003;
const MAX_ZOOM = 5;
var MAX_CANVAS_ZOOM = 1;
var MIN_ZOOM = 0;
var ZOOM_EXT = 1;

ImagePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
    toolbarZoom: PropTypes.number.isRequired | PropTypes.string.isRequired,
    setToolbarZoom: PropTypes.func.isRequired,
};

export {MIN_ZOOM, ZOOM_EXT};

export default function ImagePreview({fileInfo, toolbarZoom, setToolbarZoom}) {
    const isExternalFile = !fileInfo.id;

    const [offset, setOffset] = useState({x: 0, y: 0});
    const [dragging, setDragging] = useState(false);
    const [cursorType, setCursorType] = useState('normal');
    const [isFullscreen, setIsFullscreen] = useState({horizontal: false, vertical: false});
    const [zoom, setZoom] = useState(1);

    const touch = useRef({x: 0, y: 0});
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const observer = useRef(null);
    const canvasBorder = useRef({w: 0, h: 0});
    const isMouseDown = useRef(false);

    const background = useMemo(() => new Image(), []);

    let fileUrl;
    let previewUrl;
    if (isExternalFile) {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    } else {
        fileUrl = getFileDownloadUrl(fileInfo.id);
        previewUrl = fileInfo.has_preview_image ? getFilePreviewUrl(fileInfo.id) : fileUrl;
    }

    const clamp = (num, min, max) => {
        return Math.round(Math.min(Math.max(num, min), max) * 10000) / 10000;
    };

    const getWindowDimensions = () => {
        const maxWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - HORIZONTAL_PADDING;
        const maxHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - VERTICAL_PADDING;
        return {maxWidth, maxHeight};
    };

    // Calculate maximum scale for canvas to fit in viewport
    const fitCanvas = (width, height) => {
        const {maxWidth, maxHeight} = getWindowDimensions();
        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;

        return Math.round(Math.min(scaleX, scaleY) * 100) / 100;
    };

    // Should be revisited, try math.min(containerScale, zoom) or something also give better name
    const initCanvas = (width, height) => {
        const containerScale = fitCanvas(width, height);
        MIN_ZOOM = Math.min(containerScale, 1);
        MAX_CANVAS_ZOOM = containerScale;
        return MIN_ZOOM;
    };

    // Clamps the offset to something that is inside canvas or window depending on zoom level
    const clampOffset = (x, y) => {
        const {w, h} = canvasBorder.current;
        const {horizontal, vertical} = isFullscreen;
        var xPos = 0;
        var yPos = 0;

        if (zoom > MAX_CANVAS_ZOOM) {
            if (horizontal) {
                xPos = clamp(x, w, -w);
            }
            if (vertical) {
                yPos = clamp(y, h, -h);
            }
        }

        return {xPos, yPos};
    };

    const handleWheel = (event) => {
        event.persist();
        const {deltaY} = event;
        if (!dragging) {
            const newZoom = clamp(zoom + (deltaY * SCROLL_SENSITIVITY * -1), MIN_ZOOM, MAX_ZOOM);
            setZoom(newZoom);
            setToolbarZoom(newZoom === MIN_ZOOM ? 'A' : newZoom);
        }
    };

    const handleMouseMove = (event) => {
        if (dragging) {
            const {x, y} = touch.current;
            const {clientX, clientY} = event;
            const {xPos, yPos} = clampOffset(offset.x + (x - clientX), offset.y + (y - clientY));
            setOffset({x: xPos, y: yPos});
            touch.current = {x: clientX, y: clientY};
        }
    };

    const handleMouseDown = (event) => {
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
    const handleMouseLeave = () => {
        setDragging(false);
    };

    // Resume dragging if mouse stays clicked
    const handleMouseEnter = () => {
        if (isMouseDown.current) {
            setDragging(true);
        }
    };

    useEffect(() => {
        // Change cursor to dragging only if the image in the canvas is zoomed and draggable
        if (isFullscreen.horizontal || isFullscreen.vertical) {
            setCursorType(dragging ? 'dragging' : 'hover');
        } else {
            setCursorType('normal');
        }
    }, [dragging, isFullscreen]);

    // Resize canvas when window is resized
    useEffect(() => {
        const currentContainer = containerRef.current;
        observer.current = new ResizeObserver((entries) => {
            // Request animation frame to avoid spamming console with loop warnings
            window.requestAnimationFrame(() => {
                if (!Array.isArray(entries) || !entries.length) {
                    return;
                }
                entries.forEach(({target}) => {
                    const {width, height} = background;

                    // If container is smaller than canvas, scale canvas down
                    if ((target.clientWidth < width || target.clientHeight < height) && zoom === MIN_ZOOM) {
                        // Calculate and apply scale
                        const scale = fitCanvas(width, height);
                        MIN_ZOOM = Math.min(scale, 1);
                        setZoom(MIN_ZOOM);
                    }
                });
            });
        });

        if (zoom === MIN_ZOOM) {
            observer.current.observe(containerRef.current);
        } else {
            observer.current.unobserve(containerRef.current);
        }
        return () => observer.current.unobserve(currentContainer);
    }, [background]);

    // Initialize canvas
    useEffect(() => {
        background.src = previewUrl;

        if (canvasRef.current) {
            background.onload = () => {
                const context = canvasRef.current.getContext('2d');

                // Improve smoothing quality
                context.imageSmoothingQuality = 'high';

                // Get the image dimensions
                const {width, height} = background;
                const containerScale = initCanvas(width, height);

                canvasRef.current.width = width * containerScale;
                canvasRef.current.height = height * containerScale;

                // Initialize with the zoom at minimum.
                setZoom(MIN_ZOOM);

                // Initialize borders
                canvasBorder.current = {w: context.canvas.offsetLeft, h: context.canvas.offsetTop - 72};

                // Set image as background and scale accordingly
                context.drawImage(background, 0, 0, width * containerScale, height * containerScale);
            };
        }
    }, [background, previewUrl]);

    // for mouse centered zooming, center offset to mouse then clamp
    useEffect(() => {
        ZOOM_EXT = zoom;
        if (canvasRef.current) {
            const {width, height} = background;
            const context = canvasRef.current.getContext('2d');

            var x = 0;
            var y = 0;

            canvasRef.current.width = width * zoom;
            canvasRef.current.height = height * zoom;

            // Update borders and clamp offset accordingly
            canvasBorder.current = {w: context.canvas.offsetLeft, h: context.canvas.offsetTop - 72 - 48};
            const {xPos, yPos} = clampOffset(offset.x, offset.y);

            setIsFullscreen({
                horizontal: xPos >= canvasBorder.current.w && xPos <= -canvasBorder.current.w,
                vertical: yPos >= canvasBorder.current.h && yPos <= -canvasBorder.current.h,
            });

            context.translate(-xPos, -yPos);

            // Kept for future additions
            if (isFullscreen.horizontal || isFullscreen.vertical) {
                //x = ((context.canvas.width / zoom) - background.width) / 2;
                //y = ((context.canvas.height / zoom) - background.height) / 2;
            }

            context.drawImage(background, x, y, width * zoom, height * zoom);
        }
    }, [zoom, offset]);

    // Reset offset to center when unzoomed
    useEffect(() => {
        if (!(isFullscreen.horizontal || isFullscreen.vertical)) {
            setOffset(0, 0);
        }
    }, [isFullscreen]);

    useEffect(() => {
        const {width, height} = background;

        if (typeof toolbarZoom === 'string') {
            switch (toolbarZoom) {
            case 'A':
                setZoom(MIN_ZOOM);
                break;
            case 'F':
                setZoom(MAX_CANVAS_ZOOM);
                break;
            case 'W':
                setZoom(getWindowDimensions().maxWidth / width);
                break;
            case 'H':
                setZoom(getWindowDimensions().maxHeight / height);
                break;
            }
        } else {
            setZoom(toolbarZoom);
        }
    }, [toolbarZoom]);

    // Global mouseup event, otherwise canvas can stay stuck on mouse when leaving canvas while dragging
    window.addEventListener('mouseup', () => {
        handleMouseUp();
    });

    return (
        <div
            ref={containerRef}
            className={`image_preview_div__${zoom >= MAX_CANVAS_ZOOM ? 'fullscreen' : 'normal'}`}
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
