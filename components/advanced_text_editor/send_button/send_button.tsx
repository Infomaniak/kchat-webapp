// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Button, ButtonGroup, MenuItem, MenuList, Popover, styled} from '@mui/material';
import {ChevronUpIcon, SendIcon} from '@infomaniak/compass-icons/components';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import CompassDesignProvider from 'components/compass_design_provider';

import {t} from 'utils/i18n';

type SendButtonProps = {
    handleSubmit: (e: React.FormEvent) => void;
    disabled: boolean;
}

const SendButtonContainer = styled(Button)`
    display: flex;
    height: 32px;
    padding: 0 16px;
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

const SchedulePostButton = styled(SendButtonContainer)`
    min-width: 26px !important;
    padding: 0 5px;
`;

const StyledButtonGroup = styled(ButtonGroup)`
    border-radius: 4px;
`;

const schedulePostItems = ['1', '2', '3'];

const SendButton = ({disabled, handleSubmit}: SendButtonProps) => {
    const theme = useSelector(getTheme);
    const {formatMessage} = useIntl();
    const buttonGroupRef = useRef<HTMLDivElement>(null);
    const [schedulePostMenuOpen, setSchedulePostMenuOpen] = useState(false);

    const sendMessage = (e: React.FormEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleSubmit(e);
    };

    const handleSchedulePost = (e: React.MouseEvent) => {
        e.preventDefault();
        setSchedulePostMenuOpen(true);
    };

    const handleClose = () => setSchedulePostMenuOpen(false);

    const renderedScheduledPostItems = schedulePostItems.map((item) => <MenuItem key={item}>{item}</MenuItem>);

    return (
        <CompassDesignProvider theme={theme}>
            <StyledButtonGroup ref={buttonGroupRef}>
                <SendButtonContainer
                    data-testid='SendMessageButton'
                    tabIndex={0}
                    aria-label={formatMessage({
                        id: 'create_post.send_message',
                        defaultMessage: 'Send a message',
                    })}
                    disabled={disabled}
                    onClick={sendMessage}
                >
                    <SendIcon
                        size={18}
                        color='currentColor'
                        aria-label={formatMessage({
                            id: t('create_post.icon'),
                            defaultMessage: 'Create a post',
                        })}
                    />
                </SendButtonContainer>

                {/* start of schedule post component */}

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
                    anchorEl={buttonGroupRef.current}
                    open={schedulePostMenuOpen}
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

                {/* end of schedule post component */}
            </StyledButtonGroup>
        </CompassDesignProvider>
    );
};

export default memo(SendButton);
