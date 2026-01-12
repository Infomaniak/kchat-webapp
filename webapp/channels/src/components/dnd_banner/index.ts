// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser, getUserStatusById} from 'mattermost-redux/selectors/entities/users';

import {getUserIdFromChannelId} from 'utils/utils';

import type {GlobalState} from 'types/store/index';

import DndBanner from './dnd_banner';

export type GuestBannerConnectorProps = {
    channelId: string;
}

function makeMapStateToProps() {
    return function mapStateToProps(state: GlobalState, ownProps: GuestBannerConnectorProps) {
        const channel = getChannel(state, ownProps.channelId);
        const user = channel?.type === 'D' ? getUser(state, getUserIdFromChannelId(channel.name)) : null;
        const status = user ? getUserStatusById(state, user.id) : null;
        const shouldDisplay = Boolean(status && status === 'dnd');

        return {
            shouldDisplay,
            name: user?.first_name,
        };
    };
}

export default connect(makeMapStateToProps)(DndBanner);
