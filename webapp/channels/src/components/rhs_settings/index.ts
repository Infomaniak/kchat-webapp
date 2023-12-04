// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {getRhsSettingsTabState} from 'selectors/rhs';

import type {GlobalState} from 'types/store';

import type {Props} from './rhs_settings';
import RhsSettings from './rhs_settings';

import {getIsMobileView} from '../../selectors/views/browser';

function mapStateToProps(state: GlobalState) {
    const isMobile = getIsMobileView(state);
    const currentUser = getCurrentUser(state);
    const settingsTab = getRhsSettingsTabState(state);
    return {
        isMobile,
        currentUser,
        settingsTab,
    } as unknown as Props;
}

export default connect(mapStateToProps)(RhsSettings);
