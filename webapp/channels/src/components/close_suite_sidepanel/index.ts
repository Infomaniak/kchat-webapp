// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getKSuiteBridge} from 'selectors/ksuite_bridge';

import type {GlobalState} from 'types/store';

import CloseSuiteSidepanel from './close_suite_sidepanel';

const mapStateToProps = (state: GlobalState) => {
    return {
        bridge: getKSuiteBridge(state),
    };
};

export default withRouter(connect(mapStateToProps)(CloseSuiteSidepanel));
