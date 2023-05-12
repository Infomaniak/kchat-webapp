// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Fade, MenuProps} from '@mui/material';

import {MuiMenuStyled} from 'components/menu/menu_styled';
import {MenuItem} from 'components/menu/menu_item';

import {A11yClassNames} from 'utils/constants';

import './schedule_post_menu.scss';

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
    name: 'tomorrow' | 'monday' | 'custom';
    title: IntlMessage;
};

const schedulePostItems: SchedulePostMenuOption[] = [
    {name: 'tomorrow', title: {id: 'create_post.schedule_post.menu.options.tomorrow.title', defaultMessage: 'Tomorrow at 9:00 AM'}},
    {name: 'monday', title: {id: 'create_post.schedule_post.menu.options.monday.title', defaultMessage: 'Monday at 9:00 AM'}},
    {name: 'custom', title: {id: 'create_post.schedule_post.menu.options.custom.title', defaultMessage: 'Custom'}},
];

const menuProps: Partial<MenuProps> = {
    className: `${A11yClassNames.POPUP} schedule-post`,
    TransitionComponent: Fade,
    TransitionProps: {timeout: {
        enter: 150,
        exit: 100,
    }},
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
        <MuiMenuStyled
            open={open}
            onClose={onClose}
            anchorEl={getAnchorEl()}
            {...menuProps}
        >
            <h5 className='schedule-post__menu-header'>
                <FormattedMessage
                    id='create_post.schedule_post.menu.title'
                    defaultMessage='Schedule draft:'
                />
            </h5>
            {renderedScheduledPostItems}
        </MuiMenuStyled>
    );
};

export default SchedulePostMenu;
