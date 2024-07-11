// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {Channel} from '@mattermost/types/channels';
import type {TeamMembership} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';
import type {RelationOneToOne} from '@mattermost/types/utilities';

import {getChannelMember as getChannelMemberAction, getChannelStats, updateChannelMemberSchemeRoles} from 'mattermost-redux/actions/channels';
import {getTeamStats, getTeamMembersByIds} from 'mattermost-redux/actions/teams';
import {getProfilesInChannel, searchProfiles} from 'mattermost-redux/actions/users';
import {getChannelMemberChannel, getMyCurrentChannelMembership, getRecentProfilesFromDMs, getChannelMember} from 'mattermost-redux/selectors/entities/channels';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetAllAssociatedGroupsForReference} from 'mattermost-redux/selectors/entities/groups';
import {isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getRoles} from 'mattermost-redux/selectors/entities/roles';
import {getMembersInTeam, getMembersInCurrentTeam, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInCurrentChannel, makeGetProfilesInChannel} from 'mattermost-redux/selectors/entities/users';

import {addUsersToChannel} from 'actions/channel_actions';
import {loadStatusesForProfilesList} from 'actions/status_actions';
import {loadProfilesAndReloadChannelMembers} from 'actions/user_actions';
import {leaveChannel} from 'actions/views/channel';
import {searchAssociatedGroupsForReference} from 'actions/views/group';
import {closeModal} from 'actions/views/modals';

import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

import LeaveChannelModal from './leave_channel_modal';

type OwnProps = {
    channelId?: string;
    teamId?: string;
    channel: Channel;

}

function makeMapStateToProps(state: GlobalState, initialProps: OwnProps) {
    let doGetProfilesInChannel: (state: GlobalState, channelId: string, filters?: any) => UserProfile[];
    if (initialProps.channel.id && initialProps.channel.team_id) {
        doGetProfilesInChannel = makeGetProfilesInChannel();
    }

    return (state: GlobalState, props: OwnProps) => {
        const currentTeam = getCurrentTeam(state);
        const currentMembers = getChannelMemberChannel(state, initialProps.channel.id);
        const currentUser = getMyCurrentChannelMembership(state);
        const currentMember = currentUser ? getChannelMember(state, initialProps.channel.id, currentUser.user_id) : undefined;
        const getAllAssociatedGroupsForReference = makeGetAllAssociatedGroupsForReference();
        const currentMemberIsChannelAdmin = currentMember && currentMember.scheme_admin;
        const profilesFromRecentDMs = getRecentProfilesFromDMs(state);
        const enableCustomUserGroups = isCustomGroupsEnabled(state);
        const license = getLicense(state);
        const groups = getAllAssociatedGroupsForReference(state, true);
        const isGroupsEnabled = enableCustomUserGroups || (license?.IsLicensed === 'true' && license?.LDAPGroups === 'true');
        let profilesInCurrentChannel: UserProfile[];
        let membersInTeam: RelationOneToOne<UserProfile, TeamMembership>;
        if (props.channel.id && props.channel.team_id) {
            profilesInCurrentChannel = doGetProfilesInChannel(state, props.channel.id);
            membersInTeam = getMembersInTeam(state, props.channel.team_id);
        } else {
            profilesInCurrentChannel = getProfilesInCurrentChannel(state);
            membersInTeam = getMembersInCurrentTeam(state);
        }
        const isPrivate = initialProps.channel.type === Constants.PRIVATE_CHANNEL;
        let isInvite = false;
        const roles = getRoles(state);
        const membersArray = currentMembers ? Object.values(currentMembers).filter((user) => {
            return user?.user_id !== currentUser?.user_id;
        }) : [];

        if (isPrivate && currentMemberIsChannelAdmin) {
            const channelTeamUsers = membersArray.filter((user) => {
                const userRoles = user.roles.split(' ');
                return userRoles.some((roleName: string) => {
                    const role = roles[roleName];
                    if (role && role.permissions.includes('manage_private_channel_members')) {
                        return true;
                    }
                    return false;
                });
            }).length;
            if (channelTeamUsers < 1) {
                isInvite = true;
            }
        }

        return {
            isInvite,
            currentTeam,
            currentUser,
            groups,
            profilesFromRecentDMs,
            profilesInCurrentChannel,
            membersInTeam,
            currentMemberIsChannelAdmin,
            isGroupsEnabled,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            closeModal,
            loadProfilesAndReloadChannelMembers,
            getChannelMemberAction,
            getChannelStats,
            updateChannelMemberSchemeRoles,
            addUsersToChannel,
            getProfilesInChannel,
            getTeamStats,
            loadStatusesForProfilesList,
            searchProfiles,
            searchAssociatedGroupsForReference,
            getTeamMembersByIds,
            leaveChannel,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(LeaveChannelModal);
