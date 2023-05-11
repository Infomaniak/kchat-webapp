// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {Button, MenuItem, MenuList, Popover, styled} from '@mui/material';

import {ChevronUpIcon} from '@infomaniak/compass-icons/components';

const SchedulePostButton = styled(Button)`
    display: flex;
    height: 32px;
    min-width: 26px !important;
    padding: 0 5px;
    background: var(--button-bg);
    color: var(--button-color);
    cursor: pointer;
    place-content: center;
    place-items: center;
    transition: color 150ms;

    :hover {
        background-color: var(--button-bg);
    }

    &--disabled,
    &[disabled] {
        background: rgba(var(--center-channel-color-rgb), 0.08);

        svg {
            fill: rgba(var(--center-channel-color-rgb), 0.32);
        }
    }

    .android &,
    .ios & {
        display: flex;
    }
`;

type Props = {
    disabled: boolean;
    getAnchorEl: () => HTMLDivElement | null;
};

const schedulePostItems = ['1', '2', '3'];

const SchedulePost = ({disabled, getAnchorEl}: Props) => {
    const {formatMessage} = useIntl();
    const [open, setOpen] = useState(false);

    const handleSchedulePost = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const renderedScheduledPostItems = schedulePostItems.map((item) => <MenuItem key={item}>{item}</MenuItem>);

    return (
        <>
            <SchedulePostButton
                disabled={disabled}
                onClick={handleSchedulePost}
                aria-label={formatMessage({
                    id: 'create_post.schedule_post',
                    defaultMessage: 'Schedule post',
                })}
            >
                <ChevronUpIcon size={16}/>
            </SchedulePostButton>
            <Popover
                open={open}
                anchorEl={getAnchorEl()}
                onClose={handleClose}
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
        </>
    );
};

export default SchedulePost;
