// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import type {GlobalState} from 'types/store';

import SettingsButton from './settings_button';

function mapStateToProps(state: GlobalState) {
    return {
        currentTeamId: getCurrentTeamId(state),
    };
}

export default connect(mapStateToProps, null)(SettingsButton);
