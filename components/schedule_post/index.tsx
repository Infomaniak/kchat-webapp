// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {Button, styled} from '@mui/material';

import {ChevronUpIcon} from '@infomaniak/compass-icons/components';

import SchedulePostMenu from 'components/schedule_post/schedule_post_menu';

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

const SchedulePost = ({disabled, getAnchorEl}: Props) => {
    const {formatMessage} = useIntl();
    const [open, setOpen] = useState(false);

    const handleSchedulePost = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    return (
        <>
            <SchedulePostButton
                disableRipple={true}
                disabled={disabled}
                onClick={handleSchedulePost}
                aria-label={formatMessage({
                    id: 'create_post.schedule_post',
                    defaultMessage: 'Schedule post',
                })}
            >
                <ChevronUpIcon size={16}/>
            </SchedulePostButton>
            <SchedulePostMenu
                getAnchorEl={getAnchorEl}
                open={open}
                onClose={handleClose}
            />
        </>
    );
};

export default SchedulePost;
