// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react-hooks/exhaustive-deps */

/*
to do:
- ask about scales stuff
- fix all red stuff
- fix <option id="image-controls__custom-zoom" value="customZoom" hidden="">Actual Size Fit Width Fit Height 125% 150% 200% 300% 400% 500% 150%</option>
*/

import React, {memo, SyntheticEvent, useEffect, useState} from 'react';

import './file_preview_modal_image_controls.scss';

interface Props {
    toolbarZoom: number | string;
    setToolbarZoom: (toolbarZoom: number | string) => void;
}

// const FilePreviewModalImageControls: React.FC<Props> = (props: Props) => {
const FilePreviewModalImageControls: React.FC<Props> = ({toolbarZoom, setToolbarZoom}: Props) => {
    // Initial variables and constants
    // zoom text
    const [zoomText, setZoomText] = useState('Actual Size');

    const [whichSelected, setWhichSelected] = useState({
        A: true,
        F: false,
        W: false,
        H: false,
        1: false,
        1.25: false,
        1.5: false,
        2: false,
        3: false,
        4: false,
        5: false,
        custom: false,
    });

    const plusSign = '+';
    const minusSign = '-';

    // Make that intl
    const zoomLevels = new Map();
    zoomLevels.set('A', {text: 'Automatic', type: 'auto'});
    zoomLevels.set('F', {text: 'Fill Viewport', type: 'auto'});
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
    for (const [value, zoomLevel] of zoomLevels) {
        zoomLevelOptions.push(
            <option
                value={value}
                selected={whichSelected[value as keyof typeof whichSelected]}
            >{zoomLevel.text}</option>,
        );
    }

    zoomLevelOptions.push(
        <option
            value='customZoom'
            hidden={true}
            selected={whichSelected.custom}
        >
            {zoomText}
        </option>,
    );

    // Utils
    const clamp = (num: number, min: number, max: number) => {
        return Math.round(Math.min(Math.max(num, min), max) * 10000) / 10000; // round to avoid floating point errors
    };

    const selectItem = (item: string) => {
        let newWhichSelected = {...whichSelected};
        newWhichSelected = {
            A: false,
            F: false,
            W: false,
            H: false,
            1: false,
            1.25: false,
            1.5: false,
            2: false,
            3: false,
            4: false,
            5: false,
            custom: false,
        };
        newWhichSelected[item as keyof typeof newWhichSelected] = true;
        setWhichSelected(newWhichSelected);
    };

    // Handlers
    // change type to proper type in the future
    const handleZoomDropdown = (event: SyntheticEvent) => {
        const zoomLevel = event.target;
        if (zoomLevels.get(zoomLevel.value).type === 'scale') {
            setToolbarZoom(parseFloat(zoomLevel.value));
        } else {
            selectItem(event.target.value);
            setToolbarZoom(zoomLevel.value);
        }

        if (zoomLevel.value !== 'customZoom') {
            setZoomText(zoomLevel.innerText);
        }
    };

    const handleZoomIn = () => {
        if (typeof toolbarZoom === 'string') {
            setToolbarZoom(1); // prolly temp
        } else {
            setToolbarZoom(clamp(toolbarZoom + 0.1, 1, 5)); // maybe arrow func (toolbarZoom) => ...
        }
    };
    const handleZoomOut = () => {
        if (typeof toolbarZoom === 'string') {
            setToolbarZoom(1); // prolly temp
        } else {
            setToolbarZoom(clamp(toolbarZoom - 0.1, 1, 5)); // maybe arrow func
        }
    };

    // Callbacks
    useEffect(() => {
        if (typeof toolbarZoom === 'number') {
            setZoomText(`${Math.round(toolbarZoom * 100)}%`); // 100% is 'Actual Size'
        }
        if (zoomLevels.has(toolbarZoom.toString())) {
            selectItem(toolbarZoom.toString());
        } else {
            selectItem('custom');
        }
    }, [toolbarZoom]);

    // Elements
    const zoomDropdown = (
        <select
            onChange={handleZoomDropdown}
            className='file-preview-modal-image-controls__dropdown'
        >
            {zoomLevelOptions}
        </select>
    );

    const zoomInButton = (
        <button onClick={handleZoomIn}>{plusSign}</button>
    );
    const zoomOutButton = (
        <button onClick={handleZoomOut}>{minusSign}</button>
    );

    // Render
    return (
        <div className='file-preview-modal-image-controls'>
            {zoomOutButton}
            {zoomInButton}
            {zoomDropdown}
        </div>
    );
};

export default memo(FilePreviewModalImageControls);
