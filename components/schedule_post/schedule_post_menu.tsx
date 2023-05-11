// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MenuItem, MenuList, Popover} from '@mui/material';
import React from 'react';

type Props = {
    open: boolean;
    getAnchorEl: () => HTMLDivElement | null;
    onClose: () => void;
};

const schedulePostItems = ['1', '2', '3'];

const SchedulePostMenu = ({open, getAnchorEl, onClose}: Props) => {
    const renderedScheduledPostItems = schedulePostItems.map((item) => <MenuItem key={item}>{item}</MenuItem>);
    return (
        <Popover
            open={open}
            anchorEl={getAnchorEl()}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
        >
            <MenuList id='schedule-post-menu'>
                {renderedScheduledPostItems}
            </MenuList>
        </Popover>
    );
};

export default SchedulePostMenu;
