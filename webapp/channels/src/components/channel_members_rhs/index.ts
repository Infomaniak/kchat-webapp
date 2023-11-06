// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {AnyAction, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {Channel, ChannelMembership} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';
import type {RelationOneToOne} from '@mattermost/types/utilities';

import {getChannelPendingGuests, loadMyChannelMemberAndRole} from 'mattermost-redux/actions/channels';
import {Permissions} from 'mattermost-redux/constants';
import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {
    getCurrentChannel,
    getCurrentChannelStats,
    getMembersInCurrentChannel,
    getMyCurrentChannelMembership,
    getPendingGuestsInChannel,
    isCurrentChannelArchived,
} from 'mattermost-redux/selectors/entities/channels';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentRelativeTeamUrl, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {
    getActiveProfilesInCurrentChannelWithoutSorting,
    getUserStatuses, searchActiveProfilesInCurrentChannel,
} from 'mattermost-redux/selectors/entities/users';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {openDirectChannelToUserId} from 'actions/channel_actions';
import {loadProfilesAndReloadChannelMembers, loadProfilesAndReloadChannelMembersAll, searchProfilesAndChannelMembers} from 'actions/user_actions';
import {openModal} from 'actions/views/modals';
import {closeRightHandSide, goBack, setEditChannelMembers} from 'actions/views/rhs';
import {setChannelMembersRhsSearchTerm} from 'actions/views/search';
import {getIsEditingMembers, getPreviousRhsState} from 'selectors/rhs';

import {Constants, RHSStates} from 'utils/constants';

import type {GlobalState} from 'types/store';

import type {Props, ChannelMember} from './channel_members_rhs';
import RHS from './channel_members_rhs';

const buildProfileList = (
    profilesInCurrentChannel: UserProfile[],
    userStatuses: RelationOneToOne<UserProfile, string>,
    teammateNameDisplaySetting: string,
    membersInCurrentChannel: Record<string, ChannelMembership>,
) => {
    const channelMembers: ChannelMember[] = [];
    profilesInCurrentChannel.forEach((profile) => {
        if (!membersInCurrentChannel[profile.id]) {
            return;
        }

        channelMembers.push({
            user: profile,
            membership: membersInCurrentChannel[profile.id],
            status: userStatuses[profile.id],
            displayName: displayUsername(profile, teammateNameDisplaySetting),
        });
    });

    channelMembers.sort((a, b) => {
        if (a.membership?.scheme_admin === b.membership?.scheme_admin) {
            return a.displayName.localeCompare(b.displayName);
        }

        if (a.membership?.scheme_admin === true) {
            return -1;
        }
        return 1;
    });

    return channelMembers;
};

const getProfiles = createSelector(
    'getProfiles',
    getActiveProfilesInCurrentChannelWithoutSorting,
    getUserStatuses,
    getTeammateNameDisplaySetting,
    getMembersInCurrentChannel,
    buildProfileList,
);

const searchProfiles = createSelector(
    'searchProfiles',
    (state: GlobalState, search: string) => searchActiveProfilesInCurrentChannel(state, search, false),
    getUserStatuses,
    getTeammateNameDisplaySetting,
    getMembersInCurrentChannel,
    buildProfileList,
);

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);
    const currentUser = getMyCurrentChannelMembership(state);
    const {member_count: membersCount, guest_count: guestsCount} = getCurrentChannelStats(state) || {member_count: 0, guest_count: 0};

    if (!channel) {
        return {
            channel: {} as Channel,
            currentUserIsChannelAdmin: false,
            channelMembers: [],
            channelAdmins: [],
            searchTerms: '',
            membersCount,
            guestsCount,
            canManageMembers: false,
            canGoBack: false,
            teamUrl: '',
            pendingGuests: {},
        } as unknown as Props;
    }

    const isArchived = isCurrentChannelArchived(state);
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const canManageMembers = haveIChannelPermission(
        state,
        currentTeam.id,
        channel.id,
        isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS : Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
    ) && !isArchived;

    const searchTerms = state.views.search.channelMembersRhsSearch || '';

    let channelMembers: ChannelMember[] = [];
    if (searchTerms === '') {
        channelMembers = getProfiles(state);
    } else {
        channelMembers = searchProfiles(state, searchTerms.trim());
    }

    const teamUrl = getCurrentRelativeTeamUrl(state);
    const prevRhsState = getPreviousRhsState(state);
    const hasInfoPrevState = prevRhsState === RHSStates.CHANNEL_INFO ||
        prevRhsState === RHSStates.CHANNEL_FILES ||
        prevRhsState === RHSStates.PIN;

    const canGoBack = Boolean(hasInfoPrevState);
    const editing = getIsEditingMembers(state);

    const currentUserIsChannelAdmin = currentUser && currentUser.scheme_admin;

    const pendingGuests = getPendingGuestsInChannel(state, channel.id);

    return {
        channel,
        currentUserIsChannelAdmin,
        membersCount,
        guestsCount,
        searchTerms,
        teamUrl,
        canGoBack,
        canManageMembers,
        channelMembers,
        editing,
        pendingGuests,
    } as Props;
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
    return {
        actions: bindActionCreators({
            openModal,
            openDirectChannelToUserId,
            closeRightHandSide,
            goBack,
            setChannelMembersRhsSearchTerm,
            loadProfilesAndReloadChannelMembers,
            loadProfilesAndReloadChannelMembersAll,
            loadMyChannelMemberAndRole,
            setEditChannelMembers,
            searchProfilesAndChannelMembers,
            getChannelPendingGuests,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RHS);
