// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useRef} from 'react';
import type {ComponentProps} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import type {UserProfile} from '@mattermost/types/users';

import {getUser as selectUser, makeDisplayNameGetter} from 'mattermost-redux/selectors/entities/users';

import OverlayTrigger from 'components/overlay_trigger';
import type {BaseOverlayTrigger} from 'components/overlay_trigger';
import ProfilePopover from 'components/profile_popover/profile_popover';
import SimpleTooltip from 'components/widgets/simple_tooltip';
import Avatar from 'components/widgets/users/avatar';

import {imageURLForUser} from 'utils/utils';

import type {Registrant} from 'types/conference';
import type {GlobalState} from 'types/store';

import Status from '../status';

type Props = {
    userId: UserProfile['id'];
    overlayProps: Partial<ComponentProps<typeof SimpleTooltip>>;
    displayProfileOverlay: boolean;
    displayProfileStatus: boolean;
    status: Registrant;
} & ComponentProps<typeof Avatar>

interface MMOverlayTrigger extends BaseOverlayTrigger {
    hide: () => void;
}

const displayNameGetter = makeDisplayNameGetter();

function UserAvatar({
    userId,
    overlayProps,
    displayProfileOverlay,
    displayProfileStatus,
    status,
    ...props
}: Props) {
    const user = useSelector((state: GlobalState) => selectUser(state, userId)) as UserProfile | undefined;
    const name = useSelector((state: GlobalState) => displayNameGetter(state, true)(user));

    const profilePictureURL = userId ? imageURLForUser(userId) : '';

    const overlay = useRef<MMOverlayTrigger>(null);

    const hideProfilePopover = () => {
        overlay.current?.hide();
    };

    return (
        <OverlayTrigger
            trigger='click'
            disabled={!displayProfileOverlay}
            placement='right'
            rootClose={true}
            ref={overlay}
            overlay={
                <ProfilePopover
                    userId={userId}
                    src={profilePictureURL}
                    hide={hideProfilePopover}
                />
            }
        >
            <SimpleTooltip
                id={`name-${userId}`}
                content={name}
                {...overlayProps}
            >
                <RoundButton
                    className={'style--none'}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Status
                        showStatus={displayProfileStatus}
                        registrant={status}
                    >
                        <Avatar
                            url={imageURLForUser(userId, user?.last_picture_update)}
                            tabIndex={-1}
                            {...props}
                        />
                    </Status>
                </RoundButton>
            </SimpleTooltip>
        </OverlayTrigger>
    );
}

const RoundButton = styled.button`
    border-radius: 50%;
`;

export default memo(UserAvatar);
