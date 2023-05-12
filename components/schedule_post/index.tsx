// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Button, styled} from '@mui/material';
import {ChevronUpIcon} from '@infomaniak/compass-icons/components';

import {schedulePost} from 'mattermost-redux/actions/posts';
import {getCurrentUserTimezone} from 'selectors/general';

import SchedulePostMenu, {SchedulePostMenuOption} from 'components/schedule_post/schedule_post_menu';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';
import {getCurrentMomentForTimezone} from 'utils/timezone';
import {toUTCUnix} from 'utils/datetime';

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
    message: string;
    channelId: string;
    disabled: boolean;
    getAnchorEl: () => HTMLDivElement | null;
};

const SchedulePost = ({message, channelId, disabled, getAnchorEl}: Props) => {
    const dispatch = useDispatch();
    const timezone = useSelector(getCurrentUserTimezone);
    const {formatMessage} = useIntl();
    const [open, setOpen] = useState(false);

    const tooltip = (
        <Tooltip id='schedule-post-tooltip'>
            {formatMessage({
                id: 'create_post.schedule_post.tooltip',
                defaultMessage: 'Schedule a post',
            })}
        </Tooltip>
    );

    const handleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSchedulePost = (option: SchedulePostMenuOption) => {
        setOpen(false);
        const timestamp = getCurrentMomentForTimezone(timezone);
        switch (option.name) {
        case 'tomorrow':
            timestamp.add(1, 'day').hours(9).minutes(0).seconds(0);
            break;
        case 'monday':
            timestamp.add(1, 'week').day('Monday').hours(9).minutes(0).seconds(0);
            break;
        case 'custom':
            return;
        }
        dispatch(schedulePost(channelId, message, toUTCUnix(timestamp.toDate())));
    };

    return (
        <>
            <OverlayTrigger
                overlay={tooltip}
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                trigger={'hover'}
            >
                <SchedulePostButton
                    disableRipple={true}
                    disabled={disabled}
                    onClick={handleMenu}
                    aria-label={formatMessage({
                        id: 'create_post.schedule_post.aria',
                        defaultMessage: 'Schedule a post',
                    })}
                >
                    <ChevronUpIcon size={16}/>
                </SchedulePostButton>
            </OverlayTrigger>
            <SchedulePostMenu
                getAnchorEl={getAnchorEl}
                open={open}
                onClose={handleClose}
                handleSchedulePost={handleSchedulePost}
            />
        </>
    );
};

export default SchedulePost;
