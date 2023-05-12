// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {MenuList, Popover, PopoverProps} from '@mui/material';

import {MenuItem} from 'components/menu/menu_item';

import {A11yClassNames} from 'utils/constants';

type Props = {
    open: boolean;
    getAnchorEl: () => HTMLDivElement | null;
    onClose: () => void;
    handleSchedulePost: (option: SchedulePostMenuOption) => void;
};

type IntlMessage = {
    id: string;
    defaultMessage: string;
};

export type SchedulePostMenuOption = {
    name: string;
    title: IntlMessage;
};

const schedulePostItems = [
    {name: 'tomorrow', title: {id: 'create_post.schedule_post.menu.options.tomorrow.title', defaultMessage: 'Tomorrow at 9:00 AM'}},
    {name: 'monday', title: {id: 'create_post.schedule_post.menu.options.monday.title', defaultMessage: 'Monday at 9:00 AM'}},
    {name: 'custom', title: {id: 'create_post.schedule_post.menu.options.custom.title', defaultMessage: 'Custom'}},
];

const popoverProps: Partial<PopoverProps> = {
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'right',
    },
    transformOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
    },
};

const SchedulePostMenu = ({open, getAnchorEl, onClose, handleSchedulePost}: Props) => {
    const renderedScheduledPostItems = schedulePostItems.map((option) => (
        <MenuItem
            key={'schedule-post-menu' + option.name}
            labels={<FormattedMessage {...option.title}/>}
            onClick={() => handleSchedulePost(option)}
        />
    ));
    return (
        <Popover
            open={open}
            anchorEl={getAnchorEl()}
            onClose={onClose}
            {...popoverProps}
        >
            <MenuList
                id='schedule-post-menu'
                className={A11yClassNames.POPUP}
            >
                <h5>
                    <FormattedMessage
                        id='create_post.schedule_post.menu.title'
                        defaultMessage='Schedule draft:'
                    />
                </h5>
                {renderedScheduledPostItems}
            </MenuList>
        </Popover>
    );
};

export default SchedulePostMenu;
