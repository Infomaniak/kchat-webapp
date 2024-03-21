// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {loadRolesIfNeeded, editRole} from 'mattermost-redux/actions/roles';
import {getScheme as loadScheme, patchScheme, createScheme, getSchemeTeams as loadSchemeTeams} from 'mattermost-redux/actions/schemes';
import {updateTeamScheme} from 'mattermost-redux/actions/teams';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles';
import {getScheme, makeGetSchemeTeams} from 'mattermost-redux/selectors/entities/schemes';

import {setNavigationBlocked} from 'actions/admin_actions';

import PermissionTeamSchemeSettings from './permission_team_scheme_settings';

type OwnProps = {
    match: {
        params: {
            scheme_id: string;
        };
    };
};

function makeMapStateToProps() {
    const getSchemeTeams = makeGetSchemeTeams();

    return (state: GlobalState, ownProps: OwnProps) => {
        const schemeId = ownProps.match.params.scheme_id;
        return {
            config: getConfig(state),
            license: getLicense(state),
            schemeId,
            scheme: schemeId ? getScheme(state, schemeId) : null,
            teams: schemeId ? getSchemeTeams(state, {schemeId}) : null,
            roles: getRoles(state),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            loadRolesIfNeeded,
            loadScheme,
            loadSchemeTeams,
            editRole,
            patchScheme,
            updateTeamScheme,
            createScheme,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PermissionTeamSchemeSettings);
