// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';

import type {UserProfile} from '@mattermost/types/users';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {openDirectChannelToUserId} from 'actions/channel_actions';
import {closeRightHandSide} from 'actions/views/rhs';

import type {GlobalState} from 'types/store';

import type {GroupMember} from './user_list';
import UserList from './user_list';

type OwnProps = {
    profiles: UserProfile[];
};

const sortProfileList = (
    profiles: UserProfile[],
    teamNameDisplay: string,
) => {
    const groupMembers: GroupMember[] = [];
    profiles.forEach((profile) => {
        groupMembers.push({
            user: profile,
            displayName: displayUsername(profile, teamNameDisplay),
        });
    });

    groupMembers.sort((a, b) => {
        return a.displayName.localeCompare(b.displayName);
    });

    return groupMembers;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const teamNameDisplay = getTeammateNameDisplaySetting(state);
    const members: GroupMember[] = sortProfileList(ownProps.profiles, teamNameDisplay);

    return {
        members,
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: {
            openDirectChannelToUserId: (userId: string) =>
                dispatch(openDirectChannelToUserId(userId)),
            closeRightHandSide: () =>
                dispatch(closeRightHandSide()),
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
