// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {requestLeaveChannel} from 'actions/views/channel';

import SidebarBaseChannel from './sidebar_base_channel';

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            requestLeaveChannel,
        }, dispatch),
    };
}

const connector = connect(null, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SidebarBaseChannel);
