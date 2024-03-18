// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CloseIcon} from '@infomaniak/compass-icons/components';
import type {FC} from 'react';
import React, {useEffect, useRef} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import Popover from 'components/widgets/popover';

import Constants, {A11yClassNames, A11yCustomEventTypes} from 'utils/constants';
import type {A11yFocusEventDetail} from 'utils/constants';
import {shouldFocusMainTextbox} from 'utils/post_utils';
import * as Utils from 'utils/utils';

import {Body, CloseButton, Header, Heading, NoShrink, Subtitle, Title} from './styled';
import UserListProfiles from './user_list';
import useShouldClose from './useShouldClose';
import './guest_list_popover.scss';

export type Props = {
    channelId: string;
    channel: Channel;
    profiles: UserProfile[];
    membersCount: number;
    hide: () => void;
    returnFocus: () => void;
    showUserOverlay: (user: UserProfile) => void;
}

const GuestListPopover: FC<Props> = ({
    channel,
    profiles,
    membersCount,
    hide,
    returnFocus,
    showUserOverlay,
    ...props
}) => {
    const {formatMessage} = useIntl();

    const closeRef = useRef<HTMLButtonElement>(null);

    const shouldClose = useShouldClose();

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

    useEffect(() => {
        if (shouldClose) {
            hide();
        }
    }, [hide, shouldClose]);

    const handleClose = () => {
        hide();

        returnFocus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (shouldFocusMainTextbox(e, document.activeElement)) {
            hide();
        } else if (Utils.isKeyPressed(e, Constants.KeyCodes.ESCAPE)) {
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
        <Popover
            id='user-list-popover'
            {...props}
        >
            {tabCatcher}
            <Body
                role='dialog'
                aria-modal={true}
                onKeyDown={handleKeyDown}
                className={A11yClassNames.POPUP}
                aria-label={channel.display_name}
            >
                <Header>
                    <Heading>
                        <Title
                            className='overflow--ellipsis text-nowrap'
                        >
                            {channel.display_name}
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
        </Popover>);
};

export default React.memo(GuestListPopover);
