// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {UserProfile} from '@mattermost/types/users';

import Avatar from 'components/widgets/users/avatar';
import WithTooltip from 'components/with_tooltip';

interface Props {
    pictures: string[];
    profiles: UserProfile[];
    maxShowedProfiles: number;
}

const ConnectedProfiles = ({pictures, profiles, maxShowedProfiles}: Props) => {
    maxShowedProfiles = maxShowedProfiles || 2;
    const diff = profiles.length - maxShowedProfiles;
    profiles = diff > 0 ? profiles.slice(0, maxShowedProfiles) : profiles;

    const els = profiles.map((profile, idx) => {
        return (
            <WithTooltip
                key={'call_thread_profile_' + profile.id}
                title={profile.username}
            >
                <Avatar
                    size='sm'
                    url={pictures[idx]}
                />
            </WithTooltip>
        );
    });

    if (diff > 0) {
        els.push(
            <Avatar
                size='sm'
                text={`+${diff}`}
                key='call_thread_more_profiles'
            />,
        );
    }

    return <>{els}</>;
};

export default ConnectedProfiles;
