// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {forwardRef, memo, useRef} from 'react';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Button, ButtonGroup, styled} from '@mui/material';
import {SendIcon} from '@infomaniak/compass-icons/components';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import CompassDesignProvider from 'components/compass_design_provider';

import {t} from 'utils/i18n';
import SchedulePost from 'components/schedule_post';

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

const StyledButtonGroup = styled(ButtonGroup)`
    border-radius: 4px;
`;

const SendButton = ({disabled, handleSubmit}: SendButtonProps) => {
    const theme = useSelector(getTheme);
    const {formatMessage} = useIntl();
    const buttonGroupRef = useRef<HTMLDivElement>(null);

    const sendMessage = (e: React.FormEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleSubmit(e);
    };

    const getButonGroupRef = () => buttonGroupRef.current;

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
                <SchedulePost
                    disabled={disabled}
                    getAnchorEl={getButonGroupRef}
                />
            </StyledButtonGroup>
        </CompassDesignProvider>
    );
};

export default memo(SendButton);
