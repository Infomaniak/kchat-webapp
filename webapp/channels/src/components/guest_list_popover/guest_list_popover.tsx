// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CloseIcon} from '@infomaniak/compass-icons/components';
import type {FC} from 'react';
import React, {useEffect, useRef} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {UserProfile} from '@mattermost/types/users';

import Constants, {A11yClassNames, A11yCustomEventTypes} from 'utils/constants';
import type {A11yFocusEventDetail} from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';
import {shouldFocusMainTextbox} from 'utils/post_utils';

import {Body, CloseButton, Header, Heading, NoShrink, Subtitle, Title} from './styled';
import UserListProfiles from './user_list';

export type Props = {
    channelId: string;
    channelDisplayName: string;
    profiles: UserProfile[];
    membersCount: number;
    hide: () => void;
    returnFocus: () => void;
    showUserOverlay: (user: UserProfile) => void;
}

const GuestListPopover: FC<Props> = ({
    channelDisplayName,
    profiles,
    membersCount,
    hide,
    returnFocus,
    showUserOverlay,
}) => {
    const {formatMessage} = useIntl();

    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        document.dispatchEvent(new CustomEvent<A11yFocusEventDetail>(
            A11yCustomEventTypes.FOCUS, {
                detail: {
                    target: closeRef.current,
                    keyboardOnly: true,
                },
            },
        ));
    }, []);

    const handleClose = () => {
        hide();
        returnFocus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (shouldFocusMainTextbox(e, document.activeElement)) {
            hide();
        } else if (isKeyPressed(e, Constants.KeyCodes.ESCAPE)) {
            returnFocus();
        }
    };

    const tabCatcher = (
        <span
            tabIndex={0}
            onFocus={(e) => {
                (e.relatedTarget as HTMLElement)?.focus();
            }}
        />
    );

    return (
        <>
            {tabCatcher}
            <Body
                role='dialog'
                aria-modal={true}
                onKeyDown={handleKeyDown}
                className={A11yClassNames.POPUP}
                aria-label={channelDisplayName}
            >
                <Header>
                    <Heading>
                        <Title
                            className='overflow--ellipsis text-nowrap'
                        >
                            {channelDisplayName}
                        </Title>
                        <CloseButton
                            className='btn-icon'
                            aria-label={formatMessage({id: 'user_group_popover.close', defaultMessage: 'Close'})}
                            onClick={handleClose}
                            ref={closeRef}
                        >
                            <CloseIcon/>
                        </CloseButton>
                    </Heading>
                    <Subtitle>
                        <FormattedMessage
                            id='guest_list_popover.guestCount'
                            defaultMessage='guest_count} {guest_count, plural, one {External user} other {External users}}'
                            values={{
                                guest_count: membersCount,
                            }}
                            tagName={NoShrink}
                        />
                    </Subtitle>
                </Header>
                <UserListProfiles
                    hide={hide}
                    profiles={profiles}
                    membersCount={membersCount}
                    showUserOverlay={showUserOverlay}
                />
            </Body>
            {tabCatcher}
        </>
    );
};

export default GuestListPopover;
