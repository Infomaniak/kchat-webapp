// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@mattermost/types/store';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import {getProfilesNotInTeam, searchProfiles} from 'mattermost-redux/actions/users';
import {getProfilesNotInTeam as selectProfilesNotInTeam} from 'mattermost-redux/selectors/entities/users';

import AddUsersToTeamModal from './add_users_to_team_modal';

type Props = {
    team: Team;
    filterExcludeGuests?: boolean;
};

function mapStateToProps(state: GlobalState, props: Props) {
    const {id: teamId} = props.team;

    let filterOptions: {[key: string]: any} = {active: true};
    if (props.filterExcludeGuests) {
        filterOptions = {role: 'system_user', ...filterOptions};
    }

    const users: UserProfile[] = selectProfilesNotInTeam(state, teamId, filterOptions);

    return {
        users,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getProfilesNotInTeam,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddUsersToTeamModal);
