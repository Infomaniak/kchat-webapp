// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {checkIfTeamExists, createTeam} from 'mattermost-redux/actions/teams';
import {getProfiles} from 'mattermost-redux/actions/users';
import type {Action} from 'mattermost-redux/types/actions';

import type {Actions} from './preparing_workspace';
import PreparingWorkspace from './preparing_workspace';

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            createTeam,
            getProfiles,
            checkIfTeamExists,
        }, dispatch),
    };
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PreparingWorkspace);
