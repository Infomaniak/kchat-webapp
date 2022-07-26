// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {useRef, useMemo, useEffect, useState} from 'react';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

const SCROLL_SENSITIVITY = 0.0005;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

//import './image_preview.scss';

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export default function ImagePreview({fileInfo}) {
    const isExternalFile = !fileInfo.id;

    const [offset, setOffset] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [draggind, setDragging] = useState(false);
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

    const handleWheel = (event) => {
        event.persist();
        const {deltaY} = event;
        if (!draggind) {
            setZoom(clamp(zoom + (deltaY * SCROLL_SENSITIVITY * -1), MIN_ZOOM, MAX_ZOOM));
        }
    };

    const handleMouseMove = (event) => {
        if (draggind) {
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
        const {clientX, clientY} = event;
        touch.current = {x: clientX, y: clientY};
        setDragging(true);
    };

    const handleMouseUp = () => setDragging(false);

    useEffect(() => {
        observer.current = new ResizeObserver((entries) => {
            entries.forEach(({target}) => {
                const {width, height} = background;

                // If width of the container is smaller than image, scale image down
                if (target.clientWidth < width) {
                    // Calculate scale
                    const scale = target.clientWidth / width;

                    // Redraw image
                    canvasRef.current.width = width * scale;
                    canvasRef.current.height = height * scale;
                    canvasRef.current.
                        getContext('2d').
                        drawImage(background, 0, 0, width * scale, height * scale);
                }
            });
        });
        observer.current.observe(containerRef.current);

        return () => observer.current.unobserve(containerRef.current);
    }, [background]);

    useEffect(() => {
        background.src = previewUrl;

        if (canvasRef.current) {
            background.onload = () => {
                // Get the image dimensions
                const {width, height} = background;
                canvasRef.current.width = width;
                canvasRef.current.height = height;

                // Set image as background
                canvasRef.current.getContext('2d').drawImage(background, 0, 0);
            };
        }
    }, [background, previewUrl]);

    useEffect(() => {
        if (canvasRef.current) {
            const {width, height} = canvasRef.current;
            const context = canvasRef.current.getContext('2d');

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
        }
    }, [zoom, offset, background]);

    return (
        <div
            ref={containerRef}
        >
            <canvas
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                ref={canvasRef}
            />
        </div>
    );
}

ImagePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
};
