// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Location} from 'history';
import {connect} from 'react-redux';
import {withRouter, matchPath} from 'react-router-dom';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {
    getCurrentChannel,
    getMyChannelMemberships,
    getMyCurrentChannelMembership,
} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {close as closeLhs} from 'actions/views/lhs';
import {
    closeRightHandSide as closeRhs,
    closeMenu as closeRhsMenu,
} from 'actions/views/rhs';
import {getKSuiteBridge} from 'selectors/ksuite_bridge';
import {getIsMobileView} from 'selectors/views/browser';

import type {GlobalState} from 'types/store';

import ChannelHeaderMobile from './channel_header_mobile';

const isCurrentChannelMuted = createSelector(
    'isCurrentChannelMuted',
    getMyCurrentChannelMembership,
    (membership) => isChannelMuted(membership),
);

type OwnProps = {
    location: Location;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    const channel = getCurrentChannel(state);
    return {
        user: getCurrentUser(state),
        channel,
        isMobileView: getIsMobileView(state),
        isMuted: isCurrentChannelMuted(state),
        inGlobalThreads: Boolean(matchPath(ownProps.location.pathname, {path: '/:team/threads/:threadIdentifier?'})),
        inDrafts: Boolean(matchPath(ownProps.location.pathname, {path: '/:team/drafts'})),
        isChannelMember: channel && Boolean(getMyChannelMemberships(state)[channel.id]),

        // infomaniak
        isBridgeConnected: getKSuiteBridge(state)?.isConnected,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        closeLhs,
        closeRhs,
        closeRhsMenu,
    }, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelHeaderMobile));
