// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getMyKSuites} from 'mattermost-redux/selectors/entities/teams';

import {setUnreadFilterEnabled} from 'actions/views/channel_sidebar';
import {isUnreadFilterEnabled} from 'selectors/views/channel_sidebar';

import type {GlobalState} from 'types/store';

import ChannelFilter from './channel_filter';

function mapStateToProps(state: GlobalState) {
    const teams = getMyKSuites(state);

    return {
        hasMultipleTeams: teams && teams.length > 1,
        unreadFilterEnabled: isUnreadFilterEnabled(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            setUnreadFilterEnabled,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelFilter);
