// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import type {Channel} from '@mattermost/types/channels';

import {
    getCurrentChannel,
    getMyChannelMembership,
    getMyChannelMemberships,
    isDeactivatedDirectChannel,
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {isFirstAdmin} from 'mattermost-redux/selectors/entities/users';

import {goToLastViewedChannel} from 'actions/views/channel';

import {getIsChannelBookmarksEnabled} from 'components/channel_bookmarks/utils';

import type {GlobalState} from 'types/store';

import ChannelView from './channel_view';

function isMissingChannelRoles(state: GlobalState, channel?: Channel) {
    const channelRoles = channel ? getMyChannelMembership(state, channel.id)?.roles || '' : '';
    return !channelRoles.split(' ').some((v) => Boolean(getRoles(state)[v]));
}

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);

    const config = getConfig(state);

    const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';
    const enableOnboardingFlow = config.EnableOnboardingFlow === 'true';
    const myChannelMemberships = getMyChannelMemberships(state);
    const isMember = channel ? Boolean(myChannelMemberships[channel.id]) : false;
    const enableWebSocketEventScope = config.FeatureFlagWebSocketEventScope === 'true';

    const missingChannelRole = isMissingChannelRoles(state, channel);

    return {
        channel,
        channelId: channel ? channel.id : '',
        deactivatedChannel: channel ? isDeactivatedDirectChannel(state, channel.id) : false,
        enableOnboardingFlow,
        channelIsArchived: channel ? channel.delete_at !== 0 : false,
        viewArchivedChannels,
        isCloud: getLicense(state).Cloud === 'true',
        teamUrl: getCurrentRelativeTeamUrl(state),
        isFirstAdmin: isFirstAdmin(state),
        isMember,
        enableWebSocketEventScope,
        isChannelBookmarksEnabled: getIsChannelBookmarksEnabled(state),
        missingChannelRole,
    };
}

const mapDispatchToProps = ({
    goToLastViewedChannel,
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(ChannelView));
