// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getTeamsOrderCookie} from 'mattermost-redux/utils/team_utils';

import {getCurrentServer, getOtherServers, getServersUnreadStatus, isMultiServer} from 'selectors/views/servers';

import type {GlobalState} from 'types/store';

import SwitchServer from './switch_server';

function mapStateToProps(state: GlobalState) {
    const currentServer = getCurrentServer(state);
    const servers = getOtherServers(state);

    return {
        servers,
        currentServer,
        unreadStatus: getServersUnreadStatus(state),
        userTeamsOrderPreference: getTeamsOrderCookie(),
        isMultiServer: isMultiServer(state),
    };
}

const connector = connect(mapStateToProps, {});

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(SwitchServer));
