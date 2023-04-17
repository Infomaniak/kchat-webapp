// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {
    getJoinableTeamIds,
    getCurrentTeam,
} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {haveICurrentTeamPermission, haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';

import {Permissions} from 'mattermost-redux/constants';

import {RHSStates} from 'utils/constants';

import {showMentions, showFlaggedPosts, showSettings, closeRightHandSide, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {openModal} from 'actions/views/modals';
import {getRhsState} from 'selectors/rhs';

import {GlobalState} from 'types/store';

import MainMenu from './main_menu';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const currentTeam = getCurrentTeam(state);
    const currentUser = getCurrentUser(state);

    const appDownloadLink = config.AppDownloadLink;
    const enableCommands = config.EnableCommands === 'true';
    const enableIncomingWebhooks = config.EnableIncomingWebhooks === 'true';
    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const helpLink = config.HelpLink;
    const reportAProblemLink = config.ReportAProblemLink;

    const canManageTeamIntegrations = (haveICurrentTeamPermission(state, Permissions.MANAGE_SLASH_COMMANDS) || haveICurrentTeamPermission(state, Permissions.MANAGE_OAUTH) || haveICurrentTeamPermission(state, Permissions.MANAGE_INCOMING_WEBHOOKS) || haveICurrentTeamPermission(state, Permissions.MANAGE_OUTGOING_WEBHOOKS));
    const canManageSystemBots = (haveISystemPermission(state, {permission: Permissions.MANAGE_BOTS}) || haveISystemPermission(state, {permission: Permissions.MANAGE_OTHERS_BOTS}));
    const canManageIntegrations = canManageTeamIntegrations || canManageSystemBots;
    const canInviteTeamMember = haveICurrentTeamPermission(state, Permissions.ADD_USER_TO_TEAM);

    const joinableTeams = getJoinableTeamIds(state);
    const moreTeamsToJoin = joinableTeams && joinableTeams.length > 0;
    const rhsState = getRhsState(state);

    const ikGroupId = state.entities.teams.teams[currentTeam.id].account_id;

    return {
        appDownloadLink,
        enableCommands,
        canManageIntegrations,
        enableIncomingWebhooks,
        enableOAuthServiceProvider,
        enableOutgoingWebhooks,
        canManageSystemBots,
        experimentalPrimaryTeam,
        helpLink,
        reportAProblemLink,
        pluginMenuItems: state.plugins.components.MainMenu,
        moreTeamsToJoin,
        teamId: currentTeam.id,
        teamName: currentTeam.name,
        currentUser,
        isMentionSearch: rhsState === RHSStates.MENTION,
        isRhsSettings: rhsState === RHSStates.SETTINGS,
        teamIsGroupConstrained: Boolean(currentTeam.group_constrained),
        isLicensedForLDAPGroups: state.entities.general.license.LDAPGroups === 'true',
        guestAccessEnabled: config.EnableGuestAccounts === 'true',
        canInviteTeamMember,
        ikGroupId,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            openModal,
            showMentions,
            showFlaggedPosts,
            showSettings,
            closeRightHandSide,
            closeRhsMenu,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainMenu);
