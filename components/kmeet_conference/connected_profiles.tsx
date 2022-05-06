// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {UserProfile} from 'mattermost-redux/types/users';
import Avatar from 'components/widgets/users/avatar';
import {TAvatarSizeToken} from 'components/widgets/users/avatar/avatar';

// import Avatar from './avatar/avatar';

interface Props {
    pictures: string[];
    profiles: UserProfile[];
    maxShowedProfiles: number;
    size: TAvatarSizeToken;
}

const ConnectedProfiles = ({pictures, profiles, maxShowedProfiles, size}: Props) => {
    maxShowedProfiles = maxShowedProfiles || 2;
    const diff = profiles.length - maxShowedProfiles;
    profiles = diff > 0 ? profiles.slice(0, maxShowedProfiles) : profiles;

    const els = profiles.map((profile, idx) => {
        return profile && (
            <OverlayTrigger
                placement='bottom'
                key={'call_thread_profile_' + profile.id}
                overlay={
                    <Tooltip id='tooltip-username'>
                        {profile.username}
                    </Tooltip>
                }
            >
                <Avatar
                    size={size}
                    url={pictures[idx]}
                />
            </OverlayTrigger>
        );
    });

    if (diff > 0) {
        els.push(
            <Avatar
                size={size}
                text={`+${diff}`}
                key='call_thread_more_profiles'
            />,
        );
    }

    return <>{els}</>;
};

export default ConnectedProfiles;
