// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

// import {bindActionCreators} from 'redux';
// import type {Dispatch} from 'redux';

// import {openModal} from 'actions/views/modals';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import type {GlobalState} from 'types/store';

import SettingsButton from './settings_button';

function mapStateToProps(state: GlobalState) {
    return {
        currentTeam: getCurrentTeam(state),
    };
}

export default connect(mapStateToProps, null)(SettingsButton);
