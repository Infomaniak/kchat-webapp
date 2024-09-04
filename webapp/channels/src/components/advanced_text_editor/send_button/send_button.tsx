// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SendIcon} from '@infomaniak/compass-icons/components';
import {Button, ButtonGroup, styled} from '@mui/material';
import React, {memo, useRef} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getTheme, syncedDraftsAreAllowedAndEnabled} from 'mattermost-redux/selectors/entities/preferences';

import CompassDesignProvider from 'components/compass_design_provider';
import SchedulePostButton from 'components/schedule_post/schedule_post_button';
import {onSubmit} from 'actions/views/create_comment';
import {getPostDraft} from 'selectors/rhs';
import {StoragePrefixes} from 'utils/constants';
import {GlobalState} from 'types/store';

type SendButtonProps = {
    handleSubmit: (e: React.FormEvent) => void;
    disabled: boolean;
    isSchedulable?: boolean;
    postId: string;
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
    border-color: var(--button-color-16);

    :hover {
        background-color: var(--button-bg);
        border-color: var(--button-color-16);
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

const SendButton = ({disabled, isSchedulable, handleSubmit, postId}: SendButtonProps) => {
    const theme = useSelector(getTheme);
    const dispatch = useDispatch();
    const draft = useSelector((state: GlobalState) => getPostDraft(state, StoragePrefixes.DRAFT, postId));
    const draftsAreAllowed = useSelector(syncedDraftsAreAllowedAndEnabled);
    const {formatMessage} = useIntl();
    const buttonGroupRef = useRef<HTMLDivElement>(null);

    const sendMessage = (e: React.FormEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleSubmit(e);
    };

    const getButtonGroupRef = () => buttonGroupRef.current;

    return (
        <CompassDesignProvider theme={theme}>
            <StyledButtonGroup
                className='send-message-button'
                ref={buttonGroupRef}
            >
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
                            id: 'create_post.icon',
                            defaultMessage: 'Create a post',
                        })}
                    />
                </SendButtonContainer>
                {isSchedulable && draftsAreAllowed && (
                    <SchedulePostButton
                        disabled={disabled}
                        handleSchedulePost={(timestamp) => dispatch(onSubmit(draft, {}, true, timestamp))}
                        getAnchorEl={getButtonGroupRef}
                    />
                )}
            </StyledButtonGroup>
        </CompassDesignProvider>
    );
};

export default memo(SendButton);
