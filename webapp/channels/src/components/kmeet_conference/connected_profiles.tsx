// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {UserProfile} from '@mattermost/types/users';

import Avatar from 'components/widgets/users/avatar';
import type {TAvatarSizeToken} from 'components/widgets/users/avatar/avatar';
import WithTooltip from 'components/with_tooltip';

// import Avatar from './avatar/avatar';

interface Props {
    pictures: string[];
    profiles: UserProfile[];
    maxShowedProfiles: number;
    size: TAvatarSizeToken;
}

const ConnectedProfiles = ({pictures, profiles, maxShowedProfiles, size}: Props) => {
    const maxShowedProfilesOrDefault = maxShowedProfiles || 2;
    const diff = profiles.length - maxShowedProfilesOrDefault;
    const profilesSlice = diff > 0 ? profiles.slice(0, maxShowedProfilesOrDefault) : profiles;

    const els = profilesSlice.map((profile, idx) => {
        return profile && (
            <WithTooltip
                key={'call_thread_profile_' + profile.id}
                title={profile.username}
            >
                <Avatar
                    size={size}
                    url={pictures[idx]}
                />
            </WithTooltip>
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
