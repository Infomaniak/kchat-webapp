// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react-hooks/exhaustive-deps */

/*

to do (in no order):
- Clamp displacement to corners
- Add toolbox (zoom in, out, current zoom level...)
- Spacebar toggles dragging?
- Investigate mobile zoom in?
- Add rotation?

doing (in order):
- Allow canvas to use up all viewport space, unround corners
- Fix drag sticking if mouse out of canvas
- Zoom to where mouse is

*/

import PropTypes from 'prop-types';
import React, {useRef, useMemo, useEffect, useState} from 'react';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import './image_preview.scss';

const HORIZONTAL_PADDING = 100;
const VERTICAL_PADDING = 168;

const SCROLL_SENSITIVITY = 0.0005;
const MAX_ZOOM = 5;
var MAX_CANVAS_ZOOM = 1;
var MIN_ZOOM = 1;

export default function ImagePreview({fileInfo}) {
    const isExternalFile = !fileInfo.id;

    const [offset, setOffset] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [cursorType, setCursorType] = useState('normal');

    const touch = useRef({x: 0, y: 0});
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const observer = useRef(null);

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
        return Math.min(Math.max(num, min), max);
    };

    const getWindowDimensions = () => {
        const maxWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - HORIZONTAL_PADDING;
        const maxHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - VERTICAL_PADDING;
        return {maxWidth, maxHeight};
    };

    // cleanup, not pretty
    const fitCanvas = (width, height) => {
        const {maxWidth, maxHeight} = getWindowDimensions();

        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;

        return Math.min(scaleX, scaleY);
    };

    const initCanvas = (width, height) => {
        const containerScale = fitCanvas(width, height);
        MIN_ZOOM = containerScale <= 1 ? containerScale : 1;
        MAX_CANVAS_ZOOM = containerScale;
        return MIN_ZOOM;
    };

    const handleWheel = (event) => {
        event.persist();
        const {deltaY} = event;
        if (!dragging) {
            setZoom(clamp(zoom + (deltaY * SCROLL_SENSITIVITY * -1), MIN_ZOOM, MAX_ZOOM));
        }
    };

    const handleMouseMove = (event) => {
        if (dragging) {
            const {x, y} = touch.current;
            const {clientX, clientY} = event;
            setOffset({
                x: offset.x + (x - clientX),
                y: offset.y + (y - clientY),
            });
            touch.current = {x: clientX, y: clientY};
        }
    };

    const handleMouseDown = (event) => {
        event.preventDefault();
        const {clientX, clientY} = event;
        touch.current = {x: clientX, y: clientY};
        setDragging(true);
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    useEffect(() => {
        // Start dragging only if the image in the canvas is zoomed
        if (zoom > MAX_CANVAS_ZOOM) {
            setCursorType(dragging ? 'dragging' : 'hover');
        }
    }, [dragging]);

    useEffect(() => {
        observer.current = new ResizeObserver((entries) => {
            // Request animation frame to avoid spamming console with loop warnings
            window.requestAnimationFrame(() => {
                if (!Array.isArray(entries) || !entries.length) {
                    return;
                }

                entries.forEach(() => {
                    const {width, height} = background;
                    const containerScale = initCanvas(width, height);

                    canvasRef.current.width = width * containerScale;
                    canvasRef.current.height = height * containerScale;
                    canvasRef.current.
                        getContext('2d').
                        drawImage(background, 0, 0, width * containerScale, height * containerScale);
                });
            });
        });
        observer.current.observe(containerRef.current);
        const currentContainer = containerRef.current;

        return () => observer.current.unobserve(currentContainer);
    }, [background]);

    useEffect(() => {
        background.src = previewUrl;

        if (canvasRef.current) {
            // Better AA, could be interesting: https://stackoverflow.com/questions/17861447/html5-canvas-drawimage-how-to-apply-antialiasing

            background.onload = () => {
                // Get the image dimensions
                const {width, height} = background;
                const containerScale = initCanvas(width, height);

                canvasRef.current.width = width * containerScale;
                canvasRef.current.height = height * containerScale;

                // Initialize with the zoom at minimum.
                setZoom(MIN_ZOOM);

                // Set image as background and scale accordingly
                canvasRef.current.getContext('2d').drawImage(background, 0, 0, width * containerScale, height * containerScale);
            };
        }
    }, [background, previewUrl]);

    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');

            // We have not reached the limit, we can make canvas bigger
            if (zoom <= MAX_CANVAS_ZOOM) {
                const {width, height} = background;

                canvasRef.current.width = width * zoom;
                canvasRef.current.height = height * zoom;

                // Draw image
                context.drawImage(background, 0, 0, width * zoom, height * zoom);

                // Set the cursor type
                setCursorType('normal');
            } else {
                const {width, height} = canvasRef.current;

                // Set canvas dimensions
                canvasRef.current.width = width;
                canvasRef.current.height = height;

                // Clear canvas and scale it
                context.translate(-offset.x, -offset.y);
                context.scale(zoom, zoom);
                context.clearRect(0, 0, width, height);

                // Make sure we're zooming to the center
                const x = ((context.canvas.width / zoom) - background.width) / 2;
                const y = ((context.canvas.height / zoom) - background.height) / 2;

                // Draw image
                context.drawImage(background, x, y);

                // Set cursor type
                if (!dragging) {
                    setCursorType('hover');
                }
            }
        }
    }, [zoom, offset, background]);

    return (
        <div
            ref={containerRef}
            className='image_preview_div'
        >
            <canvas
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                ref={canvasRef}
                className={`image_preview_canvas__${cursorType}`}
            />
        </div>
    );
}

ImagePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
};
