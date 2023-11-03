// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {isAdmin, isGuest} from 'mattermost-redux/utils/user_utils';

import LocalStorageStore from 'stores/local_storage_store';

import type {GlobalState} from 'types/store';

import ErrorPage from './error_page';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const user = getCurrentUser(state);

    const teamId = LocalStorageStore.getPreviousTeamId(user?.id);
    let ikGroupId;
    let ikGroupName;
    if (teamId) {
        ({account_id: ikGroupId, display_name: ikGroupName} = getTeam(state, teamId));
    }

    return {
        siteName: config.SiteName,
        asymmetricSigningPublicKey: config.AsymmetricSigningPublicKey,
        isGuest: Boolean(user && isGuest(user.roles)),
        isAdmin: Boolean(user && isAdmin(user.roles)),
        ikGroupId,
        ikGroupName,
    };
}

export default connect(mapStateToProps)(ErrorPage);
