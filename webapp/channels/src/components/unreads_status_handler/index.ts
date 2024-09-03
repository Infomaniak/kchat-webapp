// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {RouteChildrenProps} from 'react-router-dom';
import {withRouter, matchPath} from 'react-router-dom';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {getCurrentChannel, getUnreadStatus} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import UnreadsStatusHandler from './unreads_status_handler';

type Props = RouteChildrenProps;

function mapStateToProps(state: GlobalState, {location: {pathname}}: Props) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = (currentChannel && currentChannel.teammate_id) ? currentChannel : null;
    const currentTeam = getCurrentTeam(state);

    return {
        currentChannel,
        currentTeam,
        currentTeammate,
        siteName: config.SiteName,
        unreadStatus: getUnreadStatus(state),
        inGlobalThreads: matchPath(pathname, {path: '/:team/threads/:threadIdentifier?'}) != null,
        inDrafts: matchPath(pathname, {path: '/:team/drafts'}) != null,
        inActivityAndInsights: matchPath(pathname, {path: '/:team/activity-and-insights'}) != null,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UnreadsStatusHandler));
