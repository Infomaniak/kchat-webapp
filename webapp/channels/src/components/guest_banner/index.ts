// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getAllChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import type {GlobalState} from 'types/store/index';

import GuestBanner from './guest_banner';
const EMPTY_CHANNEL_STATS = {member_count: 0, guest_count: 0, pinnedpost_count: 0, files_count: 0};

export type GuestBannerConnectorProps = {
    channelId: string;
}

function makeMapStateToProps() {
    return function mapStateToProps(state: GlobalState, ownProps: GuestBannerConnectorProps) {
        const allChannelStats = getAllChannelStats(state);
        const stats = allChannelStats?.[ownProps.channelId] || EMPTY_CHANNEL_STATS;
        const isGuest = isCurrentUserGuestUser(state);

        return {
            count: stats.guest_count,
            isGuest,
        };
    };
}

export default connect(makeMapStateToProps, {})(GuestBanner);
