// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {TeamMembership} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';
import type {RelationOneToOne} from '@mattermost/types/utilities';

import {getChannelStats, updateChannelMemberSchemeRoles, getChannelMember} from 'mattermost-redux/actions/channels';
import {getTeamStats, getTeamMembersByIds} from 'mattermost-redux/actions/teams';
import {getProfilesInChannel, getProfilesNotInChannel, searchProfiles} from 'mattermost-redux/actions/users';
import {getMembersInCurrentChannel, getMyCurrentChannelMembership, getRecentProfilesFromDMs} from 'mattermost-redux/selectors/entities/channels';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetAllAssociatedGroupsForReference} from 'mattermost-redux/selectors/entities/groups';
import {isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getMembersInTeam, getMembersInCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesNotInCurrentChannel, getProfilesInCurrentChannel, getProfilesNotInCurrentTeam, getProfilesNotInTeam, makeGetProfilesNotInChannel, makeGetProfilesInChannel} from 'mattermost-redux/selectors/entities/users';

import {addUsersToChannel} from 'actions/channel_actions';
import {loadStatusesForProfilesList} from 'actions/status_actions';
import {loadProfilesAndReloadChannelMembers} from 'actions/user_actions';
import {leaveChannel} from 'actions/views/channel';
import {searchAssociatedGroupsForReference} from 'actions/views/group';
import {closeModal} from 'actions/views/modals';

import type {GlobalState} from 'types/store';

import LeaveChannelModal from './leave_channel_modal';

type OwnProps = {
    channelId?: string;
    teamId?: string;
}

function mapStateToProps(state: GlobalState, initialProps: OwnProps) {
    const currentMembers = getMembersInCurrentChannel(state);
    const currentUser = getMyCurrentChannelMembership(state);
    const getAllAssociatedGroupsForReference = makeGetAllAssociatedGroupsForReference();
    const currentUserIsChannelAdmin = currentUser && currentUser.scheme_admin;
    const profilesFromRecentDMs = getRecentProfilesFromDMs(state);
    const enableCustomUserGroups = isCustomGroupsEnabled(state);
    const license = getLicense(state);
    const groups = getAllAssociatedGroupsForReference(state, true);
    const isGroupsEnabled = enableCustomUserGroups || (license?.IsLicensed === 'true' && license?.LDAPGroups === 'true');

    let doGetProfilesNotInChannel: (state: GlobalState, channelId: string, filters?: any) => UserProfile[];
    if (initialProps.channelId && initialProps.teamId) {
        doGetProfilesNotInChannel = makeGetProfilesNotInChannel();
    }
    let doGetProfilesInChannel: (state: GlobalState, channelId: string, filters?: any) => UserProfile[];
    if (initialProps.channelId && initialProps.teamId) {
        doGetProfilesInChannel = makeGetProfilesInChannel();
    }

    let profilesNotInCurrentTeam: UserProfile[];
    let profilesInCurrentChannel: UserProfile[];
    let profilesNotInCurrentChannel: UserProfile[];
    let membersInTeam: RelationOneToOne<UserProfile, TeamMembership>;

    return (state: GlobalState, props: OwnProps) => {
        if (props.channelId && props.teamId) {
            profilesNotInCurrentChannel = doGetProfilesNotInChannel(state, props.channelId);
            profilesInCurrentChannel = doGetProfilesInChannel(state, props.channelId);
            profilesNotInCurrentTeam = getProfilesNotInTeam(state, props.teamId);
            membersInTeam = getMembersInTeam(state, props.teamId);
        } else {
            profilesNotInCurrentChannel = getProfilesNotInCurrentChannel(state);
            profilesInCurrentChannel = getProfilesInCurrentChannel(state);
            profilesNotInCurrentTeam = getProfilesNotInCurrentTeam(state);
            membersInTeam = getMembersInCurrentTeam(state);
        }
        return {
            groups,
            profilesFromRecentDMs,
            profilesInCurrentChannel,
            membersInTeam,
            profilesNotInCurrentChannel,
            profilesNotInCurrentTeam,
            currentUserIsChannelAdmin,
            currentMembers,
            isGroupsEnabled,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getChannelMember,
            getChannelStats,
            updateChannelMemberSchemeRoles,
            addUsersToChannel,
            getProfilesNotInChannel,
            getProfilesInChannel,
            getTeamStats,
            loadStatusesForProfilesList,
            searchProfiles,
            closeModal,
            searchAssociatedGroupsForReference,
            getTeamMembersByIds,
            leaveChannel,
            loadProfilesAndReloadChannelMembers,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaveChannelModal);
