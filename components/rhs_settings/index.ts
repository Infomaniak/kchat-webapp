// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getIsMobileView} from '../../selectors/views/browser';

import RhsSettings from './rhs_settings';
import {DispatchProps, OwnProps, StateProps} from '../search/types';

function mapStateToProps(state: GlobalState) {
    const isMobile = getIsMobileView(state);
    console.log('mobile', isMobile);
    return {
        isMobile,
    };
}

export default connect<StateProps, DispatchProps, OwnProps, GlobalState>(mapStateToProps)(RhsSettings);
