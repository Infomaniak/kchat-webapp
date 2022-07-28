// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/*

to do (in no order):
- Add toolbox (zoom in, out, current zoom level...)
- Spacebar toggles dragging?
- Investigate mobile zoom in?
- Add rotation?

doing (in order):
- Better naming
- cleanup
- comments
- Zoom to where mouse is

*/

import PropTypes from 'prop-types';
import React, {useRef, useMemo, useEffect, useState} from 'react';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import './image_preview.scss';

const HORIZONTAL_PADDING = 50;
const VERTICAL_PADDING = 168;

const SCROLL_SENSITIVITY = 0.0005;
const MAX_ZOOM = 5;
var MAX_CANVAS_ZOOM = 2;
var MIN_ZOOM = 1;

export default function ImagePreview({fileInfo}) {
    const isExternalFile = !fileInfo.id;

    const [offset, setOffset] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [cursorType, setCursorType] = useState('normal');
    const [isMouseDown, setIsMouseDown] = useState(false); // u sure u need useState?

    const touch = useRef({x: 0, y: 0});
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const observer = useRef(null);
    const canvasBorder = useRef({w: 0, h: 0});
    const horizontalFullscreen = useRef(false);
    const verticalFullscreen = useRef(false);

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

    const clampOffset = (x, y) => {
        const {w, h} = canvasBorder.current;
        var xPosClamp = 0;
        var yPosClamp = 0;

        if (horizontalFullscreen.current) {
            xPosClamp = clamp(x, w, -w);
        }
        if (verticalFullscreen.current) {
            yPosClamp = clamp(y, h, -h);
        }

        return {xPos: xPosClamp, yPos: yPosClamp};
    };

    const handleWheel = (event) => {
        event.persist();
        const {deltaY} = event;
        if (!dragging) {
            setZoom(clamp(zoom + (deltaY * SCROLL_SENSITIVITY * -1), MIN_ZOOM, MAX_ZOOM));
        }
    };

    // separate to a callable function
    // have it called each time zoom is called
    // change mode to snap to canvas when image in bounds with ((top && bottom) || (left && right))
    const handleMouseMove = (event) => {
        if (dragging) {
            const {x, y} = touch.current;
            const {clientX, clientY} = event;
            const {xPos, yPos} = clampOffset(offset.x + (x - clientX), offset.y + (y - clientY)) // god these names are horrible
            setOffset({x: xPos, y: yPos});
            touch.current = {x: clientX, y: clientY};
        }
    };

    const handleMouseDown = (event) => {
        event.preventDefault();
        const {clientX, clientY} = event;
        touch.current = {x: clientX, y: clientY};
        setIsMouseDown(true);
        setDragging(true);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
        setDragging(false);
    };

    // Stop dragging if mouse left canvas
    const handleMouseLeave = () => {
        setDragging(false);
    };

    // Resume dragging if mouse stays clicked
    const handleMouseEnter = () => {
        if (isMouseDown) {
            setDragging(true);
        }
    };

    // stays here for debug for now
    useEffect(() => {
        // eslint-disable-next-line no-console
        //console.log(zoom, zoom >= MAX_CANVAS_ZOOM ? 'fullscreen' : 'normal');
    }, [zoom]);

    useEffect(() => {
        // Start dragging only if the image in the canvas is zoomed (update this comment pls)
        if (zoom > MAX_CANVAS_ZOOM) {
            setCursorType(dragging ? 'dragging' : 'hover');
        } else {
            setCursorType('normal');
        }
    }, [dragging, zoom]);

    // broken again...
    useEffect(() => {
        observer.current = new ResizeObserver((entries) => {
            // Request animation frame to avoid spamming console with loop warnings
            window.requestAnimationFrame(() => {
                if (!Array.isArray(entries) || !entries.length || zoom !== MIN_ZOOM) {
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
            // imageSmoothingQuality: "low"

            background.onload = () => {
                const context = canvasRef.current.getContext('2d');

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

    // change fullscreen switching to actual fullscreen, dragging is broken otherwise... (kinda)
    // for mouse centered zooming, center thing to mouse then clamp
    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            const {width, height} = background;

            var inBoundsTop = true;
            var inBoundsBottom = true;
            var inBoundsLeft = true;
            var inBoundsRight = true;
            var x = 0;
            var y = 0;

            canvasRef.current.width = width * zoom;
            canvasRef.current.height = height * zoom;

            if (zoom > MAX_CANVAS_ZOOM) {
                // Update borders and clamp offset accordingly
                canvasBorder.current = {w: context.canvas.offsetLeft, h: context.canvas.offsetTop - 72};
                const {xPos, yPos} = clampOffset(offset.x, offset.y);

                context.translate(-xPos, -yPos);

                if (xPos < context.canvas.offsetLeft) {
                    inBoundsLeft = false;
                }
                if (xPos > -context.canvas.offsetLeft) {
                    inBoundsRight = false;
                }
                if (yPos < context.canvas.offsetTop - 72) {
                    inBoundsTop = false;
                }
                if (yPos > -(context.canvas.offsetTop - 72)) {
                    inBoundsBottom = false;
                }

                if (inBoundsLeft && inBoundsRight) {
                    horizontalFullscreen.current = true;
                } else {
                    horizontalFullscreen.current = false;
                }
                if (inBoundsTop && inBoundsBottom) {
                    verticalFullscreen.current = true;
                } else {
                    verticalFullscreen.current = false;
                }

                //console.log(`Top: ${inBoundsTop} | Bottom: ${inBoundsBottom} | Left: ${inBoundsLeft} | Right: ${inBoundsRight}`);

                // Make sure we're zooming to the center, to be changed in favor of mouse
                //x = ((context.canvas.width / zoom) - background.width) / 2;
                //y = ((context.canvas.height / zoom) - background.height) / 2;
            }

            // Draw image
            context.drawImage(background, x, y, width * zoom, height * zoom);
        }
    }, [zoom, offset, background]);

    // Global mouseup event, otherwise canvas can stay stuck on mouse when leaving canvas while dragging
    window.addEventListener('mouseup', () => {
        handleMouseUp();
    });

    return (
        <div
            ref={containerRef}
            // change this to either fullscreens
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

ImagePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
};
