// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {toggleMenu as toggleRhsMenu} from 'actions/views/rhs';
import {getKSuiteBridge} from 'selectors/ksuite_bridge';

import type {GlobalState} from 'types/store';

import CollapseRhsButton from './collapse_rhs_button';

const mapStateToProps = (state: GlobalState) => {
    return {
        isBridgeActive: getKSuiteBridge(state)?.isConnected,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        toggleRhsMenu,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollapseRhsButton);
