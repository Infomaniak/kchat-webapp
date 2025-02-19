// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useRef} from 'react';
import type {ComponentProps} from 'react';
import styled from 'styled-components';

import type {UserProfile} from '@mattermost/types/users';

import OverlayTrigger from 'components/overlay_trigger';
import type {BaseOverlayTrigger} from 'components/overlay_trigger';
import ProfilePopover from 'components/profile_popover';
import SimpleTooltip from 'components/widgets/simple_tooltip';
import Avatar from 'components/widgets/users/avatar';

import {imageURLForUser} from 'utils/utils';

import type {Registrant} from 'types/conference';

import Status from '../status';

type Props = {
    userId: UserProfile['id'];
    overlayProps: Partial<ComponentProps<typeof SimpleTooltip>>;
    displayProfileOverlay: boolean;
    displayProfileStatus: boolean;
    disableFetch?: boolean;
    rootClose?: boolean;
    status?: Registrant;
    user: UserProfile;
    name: string | undefined;
} & ComponentProps<typeof Avatar>

interface MMOverlayTrigger extends BaseOverlayTrigger {
    hide: () => void;
}

function UserAvatar({
    userId,
    overlayProps,
    displayProfileOverlay,
    displayProfileStatus,
    disableFetch,
    status,
    user,
    name,
    rootClose = true,
    ...props
}: Props) {
    const profilePictureURL = userId ? imageURLForUser(userId) : '';

    const overlay = useRef<MMOverlayTrigger>(null);

    const hideProfilePopover = () => {
        overlay.current?.hide();
    };
    console.log('rootClose', rootClose);
    return (
        <OverlayTrigger
            trigger='click'
            disabled={!displayProfileOverlay}
            placement='right'
            rootClose={rootClose}
            ref={overlay}
            overlay={
                <ProfilePopover
                    className='user-profile-popover'
                    userId={userId}
                    src={profilePictureURL}
                    hide={hideProfilePopover}
                    disableFetch={disableFetch}
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
                            url={(user && user.public_picture_url) || imageURLForUser(userId, user?.last_picture_update)}
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
