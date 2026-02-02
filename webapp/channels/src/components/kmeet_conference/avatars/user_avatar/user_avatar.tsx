// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import type {ComponentProps} from 'react';
import styled from 'styled-components';

import type {UserProfile} from '@mattermost/types/users';

import ProfilePopover from 'components/profile_popover';
import SimpleTooltip from 'components/widgets/simple_tooltip';
import Avatar from 'components/widgets/users/avatar';

import {imageURLForUser} from 'utils/utils';

import type {Registrant} from 'types/conference';

import Status from '../status';

type Props = {
    user: UserProfile;
    overlayProps: Partial<ComponentProps<typeof SimpleTooltip>>;
    displayProfileOverlay: boolean;
    displayProfileStatus: boolean;
    disableFetch?: boolean;
    rootClose?: boolean;
    status?: Registrant;
} & ComponentProps<typeof Avatar>

function UserAvatar({
    user,
    overlayProps,
    displayProfileOverlay,
    displayProfileStatus,
    status,
    ...props
}: Props) {
    const profilePictureURL = user.id ? imageURLForUser(user.id) : '';

    return (

        <ProfilePopover
            disabled={!displayProfileOverlay}
            userId={user.id}
            src={profilePictureURL}
            isAnyModalOpen={false}
        >
            <SimpleTooltip
                id={`name-${user.id}`}
                content={user.username}
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
                            url={imageURLForUser(user.id, user?.last_picture_update)}
                            tabIndex={-1}
                            {...props}
                        />
                    </Status>
                </RoundButton>

            </SimpleTooltip>
        </ProfilePopover>
    );
}

const RoundButton = styled.button`
    border-radius: 50%;
`;

export default memo(UserAvatar);
