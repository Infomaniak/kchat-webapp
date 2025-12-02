// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, type Dispatch} from 'redux';

import {getChannelGuestMembers} from 'mattermost-redux/actions/channels';
import {getChannelGuestMembersCount} from 'mattermost-redux/selectors/entities/channels';
import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

import GuestBanner from './guest_banner';

export type GuestBannerConnectorProps = {
    channelId: string;
}

function makeMapStateToProps() {
    return function mapStateToProps(state: GlobalState, ownProps: GuestBannerConnectorProps) {
        const isGuest = isCurrentUserGuestUser(state);

        return {
            count: getChannelGuestMembersCount(state, ownProps.channelId),
            isGuest,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getChannelGuestMembers,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(GuestBanner);
