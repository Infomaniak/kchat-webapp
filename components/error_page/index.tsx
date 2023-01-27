// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';

import {GlobalState} from 'types/store';

import {isAdmin, isGuest} from 'mattermost-redux/utils/user_utils';

import ErrorPage from './error_page';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import LocalStorageStore from 'stores/local_storage_store';

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
