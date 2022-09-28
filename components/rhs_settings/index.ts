// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getIsMobileView} from '../../selectors/views/browser';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import RhsSettings, {Props} from './rhs_settings';

function mapStateToProps(state: GlobalState) {
    const isMobile = getIsMobileView(state);
    const currentUser = getCurrentUser(state);
    return {
        isMobile,
        currentUser,
    } as unknown as Props;
}

export default connect(mapStateToProps)(RhsSettings);
