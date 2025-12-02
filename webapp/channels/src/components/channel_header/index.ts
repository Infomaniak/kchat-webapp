// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {
    updateChannelNotifyProps,
} from 'mattermost-redux/actions/channels';
import {getCustomEmojisInText} from 'mattermost-redux/actions/emojis';
import {Permissions, General} from 'mattermost-redux/constants';
import {
    getCurrentChannel,
    getMyCurrentChannelMembership,
    isCurrentChannelMuted,
    getCurrentChannelStats,
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {
    displayLastActiveLabel,
    getCurrentUser,
    getLastActiveTimestampUnits,
    getLastActivityForUserId,
    getUser,
    isCurrentUserGuestUser,
    makeGetProfilesInChannel,
} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';

import {
    showPinnedPosts,
    showChannelFiles,
    closeRightHandSide,
    showChannelMembers,
} from 'actions/views/rhs';
import {getShowTutorialStep} from 'selectors/onboarding';
import {getRhsState} from 'selectors/rhs';
import {makeGetCustomStatus, isCustomStatusEnabled, isCustomStatusExpired} from 'selectors/views/custom_status';

import {OnboardingTasksName} from 'components/onboarding_tasks';
import {OnboardingTourSteps, OnboardingTourStepsForGuestUsers, TutorialTourName} from 'components/tours';

import {isFileAttachmentsEnabled} from 'utils/file_utils';

import type {GlobalState} from 'types/store';

import ChannelHeader from './channel_header';

function makeMapStateToProps() {
    const doGetProfilesInChannel = makeGetProfilesInChannel();
    const getCustomStatus = makeGetCustomStatus();
    let timestampUnits: string[] = [];

    return function mapStateToProps(state: GlobalState) {
        const channel = getCurrentChannel(state);
        const user = getCurrentUser(state);
        const config = getConfig(state);

        const isGuest = isCurrentUserGuestUser(state);
        const showChannelHeaderTutorialStep = getShowTutorialStep(state, {
            tourName: isGuest ? TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS : TutorialTourName.ONBOARDING_TUTORIAL_STEP,
            taskName: OnboardingTasksName.CHANNELS_TOUR,
            tourStep: isGuest ? OnboardingTourStepsForGuestUsers.CHANNEL_HEADER : OnboardingTourSteps.CHANNEL_HEADER,
        });

        let dmUser;
        let gmMembers;
        let customStatus;
        let lastActivityTimestamp;

        if (channel && channel.type === General.DM_CHANNEL) {
            const dmUserId = getUserIdFromChannelName(user.id, channel.name);
            dmUser = getUser(state, dmUserId);
            customStatus = dmUser && getCustomStatus(state, dmUser.id);
            lastActivityTimestamp = dmUser && getLastActivityForUserId(state, dmUser.id);
        } else if (channel && channel.type === General.GM_CHANNEL) {
            gmMembers = doGetProfilesInChannel(state, channel.id);
        }
        const stats = getCurrentChannelStats(state);

        let isLastActiveEnabled = false;
        if (dmUser) {
            isLastActiveEnabled = displayLastActiveLabel(state, dmUser.id);
            timestampUnits = getLastActiveTimestampUnits(state, dmUser.id);
        }

        // ik: for meet button visibility
        const channelMembership = getMyCurrentChannelMembership(state);
        const canPost = (channelMembership && haveIChannelPermission(state, channel?.team_id, channel?.id, Permissions.CREATE_POST)) ?? false;

        return {
            teamId: getCurrentTeamId(state),
            channel,
            channelMember: channelMembership,
            canPost,
            memberCount: stats?.member_count || 0,
            currentUser: user,
            dmUser,
            gmMembers,
            rhsState: getRhsState(state),
            hasGuests: false,

            // hasGuests: stats ? stats.guest_count > 0 : false,
            isChannelMuted: isCurrentChannelMuted(state),
            pinnedPostsCount: stats?.pinnedpost_count || 0,
            customStatus,
            isCustomStatusEnabled: isCustomStatusEnabled(state),
            isCustomStatusExpired: isCustomStatusExpired(state, customStatus),
            lastActivityTimestamp,
            isFileAttachmentsEnabled: isFileAttachmentsEnabled(config),
            isLastActiveEnabled,
            timestampUnits,
            showChannelHeaderTutorialStep,
        };
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        showPinnedPosts,
        showChannelFiles,
        closeRightHandSide,
        getCustomEmojisInText,
        updateChannelNotifyProps,
        showChannelMembers,
    }, dispatch),
});

const connector = connect(makeMapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(ChannelHeader));
