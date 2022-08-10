// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react-hooks/exhaustive-deps */

/*
to do:
- buttons are still clickable when inactive, fix that
- make text internat
*/

import React, {ChangeEvent, memo, useEffect, useState} from 'react';

import {MIN_ZOOM_EXT, ZOOM_EXT} from '../image_preview';
import './file_preview_modal_image_controls.scss';

let zoomInButtonActive = true;
let zoomOutButtonActive = false;

interface Props {
    toolbarZoom: number | string;
    setToolbarZoom: (toolbarZoom: number | string) => void;
}

const FilePreviewModalImageControls: React.FC<Props> = ({toolbarZoom, setToolbarZoom}: Props) => {
    // Initial variables and constants
    // zoom text
    const [zoomText, setZoomText] = useState<string>();
    const [selectedZoomValue, setSelectedZoomValue] = useState<string>();

    const plusSign = <i className='icon-plus'/>;
    const minusSign = <i className='icon-minus'/>;

    // Make that intl
    const zoomLevels = new Map();
    zoomLevels.set('A', {text: 'Automatic', type: 'auto'});
    zoomLevels.set('W', {text: 'Fit Width', type: 'auto'});
    zoomLevels.set('H', {text: 'Fit Height', type: 'auto'});
    zoomLevels.set('1', {text: '100%', type: 'scale'});
    zoomLevels.set('1.25', {text: '125%', type: 'scale'});
    zoomLevels.set('1.5', {text: '150%', type: 'scale'});
    zoomLevels.set('2', {text: '200%', type: 'scale'});
    zoomLevels.set('3', {text: '300%', type: 'scale'});
    zoomLevels.set('4', {text: '400%', type: 'scale'});
    zoomLevels.set('5', {text: '500%', type: 'scale'});

    const zoomLevelOptions = [];
    for (const [zoomLevelKey, zoomLevel] of zoomLevels) {
        zoomLevelOptions.push(
            <option
                key={zoomLevelKey}
                value={zoomLevelKey}
            >{zoomLevel.text}</option>,
        );
    }

    zoomLevelOptions.push(
        <option
            key={'customZoom'}
            value='customZoom'
            hidden={true}
        >
            {zoomText}
        </option>,
    );

    // Utils
    const clamp = (num: number, min: number, max: number) => {
        return Math.round(Math.min(Math.max(num, min), max) * 10000) / 10000; // round to avoid floating point errors
    };

    // Handlers
    // change type to proper type in the future
    const handleZoomDropdown = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const zoomLevel = event.target;
        if (zoomLevels.get(zoomLevel.value).type === 'scale') {
            setToolbarZoom(parseFloat(zoomLevel.value));
        } else {
            setToolbarZoom(zoomLevel.value);
        }
    };

    const handleZoomIn = () => {
        handleZoomButtons(0.1);
    };
    const handleZoomOut = () => {
        handleZoomButtons(-0.1);
    };
    const handleZoomButtons = (delta: number) => {
        let newToolbarZoom = typeof toolbarZoom === 'string' ? ZOOM_EXT : toolbarZoom;
        newToolbarZoom = Math.round(newToolbarZoom * 10) / 10;
        newToolbarZoom = clamp(newToolbarZoom + delta, MIN_ZOOM_EXT, 5);
        setToolbarZoom(newToolbarZoom === MIN_ZOOM_EXT ? 'A' : newToolbarZoom);

        zoomInButtonActive = newToolbarZoom < 5;
        zoomOutButtonActive = newToolbarZoom > MIN_ZOOM_EXT;
    };

    // Callbacks
    useEffect(() => {
        if (typeof toolbarZoom === 'number') {
            setZoomText(`${Math.round(toolbarZoom * 100)}%`);
            zoomInButtonActive = toolbarZoom < 5;
            zoomOutButtonActive = toolbarZoom > MIN_ZOOM_EXT;
        } else if (toolbarZoom === 'A') {
            zoomInButtonActive = true;
            zoomOutButtonActive = false;
        }

        if (zoomLevels.has(toolbarZoom.toString())) {
            setSelectedZoomValue(toolbarZoom.toString());
        } else {
            setSelectedZoomValue('customZoom');
        }
    }, [toolbarZoom]);

    // Elements
    const zoomDropdown = (
        <select
            onChange={handleZoomDropdown}
            className='image-controls-dropdown'
            defaultValue={'A'}
            value={selectedZoomValue}
        >
            {zoomLevelOptions}
        </select>
    );

    const zoomInButton = (
        <button
            onClick={handleZoomIn}
            className={`image-controls-button ${zoomInButtonActive ? 'active' : 'inactive'}`}
        >
            {plusSign}
        </button>
    );
    const zoomOutButton = (
        <button
            onClick={handleZoomOut}
            className={`image-controls-button ${zoomOutButtonActive ? 'active' : 'inactive'}`}
        >
            {minusSign}
        </button>
    );

    // Render
    return (
        <div className='image-controls'>
            {zoomOutButton}
            {zoomInButton}
            {zoomDropdown}
        </div>
    );
};

export default memo(FilePreviewModalImageControls);
