// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import clamp from 'lodash/clamp';
import React, {useEffect, useRef, useState} from 'react';

import type {FileInfo} from '@mattermost/types/files';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import type {ZoomValue} from 'components/file_preview_modal/file_preview_modal_image_controls/file_preview_modal_image_controls';
import type {LinkInfo} from 'components/file_preview_modal/types';

import './image_preview.scss';
import {FileTypes} from 'utils/constants';
import {getFileType} from 'utils/utils';

const SCROLL_SENSITIVITY = 0.003;
const DEFAULT_MAX_SCALE = 5;
const DEFAULT_MIN_SCALE = 1;

let zoomExport: number;
let minZoomExport: number;

interface Props {
    fileInfo: FileInfo & LinkInfo;
    toolbarZoom: ZoomValue;
    setToolbarZoom: (toolbarZoom: ZoomValue) => void;
}

const getFitScale = (imageWidth: number, imageHeight: number, containerWidth: number, containerHeight: number) => {
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    return Math.min(scaleX, scaleY);
};

export default function ImagePreview({fileInfo, toolbarZoom, setToolbarZoom}: Props) {
    const [scale, setScale] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [containerSize, setContainerSize] = useState({width: 0, height: 0});

    const imgRef = useRef<HTMLImageElement>(null);
    const isMouseDown = useRef(false);
    const dragStart = useRef({x: 0, y: 0, offsetX: 0, offsetY: 0});
    const lastToolbarZoom = useRef<ZoomValue>(toolbarZoom);
    const imgNaturalSize = useRef({width: 0, height: 0});

    const isExternalFile = !fileInfo.id;
    const fileUrl = isExternalFile ? fileInfo.link : getFileDownloadUrl(fileInfo.id);
    let previewUrl: string;
    if (isExternalFile) {
        previewUrl = fileInfo.link;
    } else if (fileInfo.has_preview_image) {
        previewUrl = getFilePreviewUrl(fileInfo.id);
    } else {
        previewUrl = fileUrl;
    }

    useEffect(() => {
        const el = imgRef.current?.parentElement?.parentElement;
        let ro: ResizeObserver | undefined;
        if (el) {
            ro = new ResizeObserver((entries) => {
                const cr = entries[0].contentRect;
                setContainerSize({width: cr.width, height: cr.height});
            });
            ro.observe(el);
        }
        return () => ro?.disconnect();
    }, []);

    useEffect(() => {
        setScale(0);
        setOffsetX(0);
        setOffsetY(0);
        lastToolbarZoom.current = 'A';
        setToolbarZoom('A');
    }, [previewUrl, setToolbarZoom]);

    const imgWidth = imgRef.current?.width || 1;
    const imgHeight = imgRef.current?.height || 1;
    const containerWidth = containerSize.width || 1;
    const containerHeight = containerSize.height || 1;

    const fitScale = imgRef.current ? getFitScale(imgWidth, imgHeight, containerWidth, containerHeight) : 1;
    const minScale = Math.min(fitScale, DEFAULT_MIN_SCALE);
    const maxScale = imgRef.current ? Math.max(Math.round(DEFAULT_MAX_SCALE * (imgNaturalSize.current.width / imgWidth) * 100) / 100, DEFAULT_MAX_SCALE) : DEFAULT_MAX_SCALE;

    useEffect(() => {
        if (scale === 0 && imgRef.current && containerSize.width !== 0) {
            setScale(minScale);
        }
    }, [scale, minScale, containerSize.width]);

    useEffect(() => {
        if (imgRef.current && scale !== 0 && toolbarZoom !== lastToolbarZoom.current) {
            lastToolbarZoom.current = toolbarZoom;

            let newScale: number;
            switch (toolbarZoom) {
            case 'A':
                newScale = minScale;
                break;
            case 'W':
                newScale = clamp(containerWidth / imgWidth, minScale, maxScale);
                break;
            case 'H':
                newScale = clamp(containerHeight / imgHeight, minScale, maxScale);
                break;
            default:
                newScale = toolbarZoom * (maxScale / DEFAULT_MAX_SCALE);
                break;
            }

            if (newScale !== scale) {
                const ratio = newScale / scale;
                setScale(newScale);
                setOffsetX((prev) => prev * ratio);
                setOffsetY((prev) => prev * ratio);
            }
        }
    }, [toolbarZoom, scale, minScale, maxScale, containerWidth, containerHeight, imgWidth, imgHeight]);

    useEffect(() => {
        const handleMouseUp = () => {
            isMouseDown.current = false;
            setIsDragging(false);
        };
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const clampOffset = (ox: number, oy: number, s: number) => {
        const overflowW = Math.max(((imgWidth * s) - containerWidth) / 2, 0);
        const overflowH = Math.max(((imgHeight * s) - containerHeight) / 2, 0);
        return {
            x: overflowW > 0 ? clamp(ox, -overflowW, overflowW) : 0,
            y: overflowH > 0 ? clamp(oy, -overflowH, overflowH) : 0,
        };
    };

    const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
        e.preventDefault();
        if (!imgRef.current?.parentElement || scale === 0) {
            return;
        }

        const rect = imgRef.current.parentElement.getBoundingClientRect();
        const centerX = rect.left + (rect.width / 2);
        const centerY = rect.top + (rect.height / 2);

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const oldScale = scale;
        const newScale = clamp(oldScale + (e.deltaY * -SCROLL_SENSITIVITY), minScale, maxScale);
        if (newScale === oldScale) {
            return;
        }

        const ratio = newScale / oldScale;
        const newOffsetX = offsetX + (mouseX * (1 - ratio));
        const newOffsetY = offsetY + (mouseY * (1 - ratio));

        const clamped = clampOffset(newOffsetX, newOffsetY, newScale);
        setScale(newScale);
        setOffsetX(clamped.x);
        setOffsetY(clamped.y);

        const toolbarValue = newScale === minScale ? 'A' : newScale / (maxScale / DEFAULT_MAX_SCALE);
        lastToolbarZoom.current = toolbarValue;
        setToolbarZoom(toolbarValue);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isMouseDown.current = true;
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            offsetX,
            offsetY,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) {
            return;
        }

        const overflowW = Math.max(((imgWidth * scale) - containerWidth) / 2, 0);
        const overflowH = Math.max(((imgHeight * scale) - containerHeight) / 2, 0);
        if (overflowW === 0 && overflowH === 0) {
            return;
        }

        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        const newOffsetX = overflowW > 0 ? clamp(dragStart.current.offsetX + dx, -overflowW, overflowW) : 0;
        const newOffsetY = overflowH > 0 ? clamp(dragStart.current.offsetY + dy, -overflowH, overflowH) : 0;

        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    const handleMouseEnter = () => {
        if (isMouseDown.current && !isDragging) {
            setIsDragging(true);
        }
    };

    const handleLoad = () => {
        if (imgRef.current) {
            imgNaturalSize.current = {
                width: imgRef.current.naturalWidth,
                height: imgRef.current.naturalHeight,
            };
        }
    };

    const imageOverflows = scale > fitScale;
    let cursorType = 'normal';
    if (imageOverflows) {
        cursorType = isDragging ? 'dragging' : 'hover';
    }

    zoomExport = scale;
    minZoomExport = minScale;

    const containerStyle = {
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    };

    let conditionalSVGStyleAttribute;
    if (getFileType(fileInfo.extension) === FileTypes.SVG) {
        conditionalSVGStyleAttribute = {
            width: fileInfo.width,
            height: 'auto',
        };
    }

    return (
        <div
            style={containerStyle}
        >
            <img
                className={classNames(`image_preview image_preview__${cursorType}`, {
                    image_preview__fullscreen: imageOverflows,
                })}
                ref={imgRef}
                src={previewUrl}
                onLoad={handleLoad}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                onWheel={handleWheel}
                style={conditionalSVGStyleAttribute}
            />
        </div>
    );
}

export {zoomExport, minZoomExport};
