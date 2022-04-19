// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { login } from 'actions/views/login';
import { getConfig } from 'mattermost-redux/selectors/entities/general';
import { getMyTeamMember, getTeamByName } from 'mattermost-redux/selectors/entities/teams';
import { getCurrentUser } from 'mattermost-redux/selectors/entities/users';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LoginDesktopController from './login_desktop_controller.jsx';





function mapStateToProps(state) {
    const config = getConfig(state);

    const customBrandText = config.CustomBrandText;
    const customDescriptionText = config.CustomDescriptionText;

    const siteName = config.SiteName;

    // Only set experimental team if user is on that team
    let experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    if (experimentalPrimaryTeam) {
        const team = getTeamByName(state, experimentalPrimaryTeam);
        if (team) {
            const member = getMyTeamMember(state, team.id);
            if (!member || !member.team_id) {
                experimentalPrimaryTeam = null;
            }
        } else {
            experimentalPrimaryTeam = null;
        }
    }

    return {
        currentUser: getCurrentUser(state),
        customBrandText,
        customDescriptionText,
        siteName,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            login,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginDesktopController);
