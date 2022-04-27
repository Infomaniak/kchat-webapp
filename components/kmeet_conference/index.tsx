// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {GlobalState} from 'types/store';

import {showExpandedView} from 'actions/calls';

import Conference from './kmeet_conference';

function mapStateToProps(state: GlobalState) {
    return {
        currentUserId: getCurrentUserId(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            showExpandedView,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Conference);
