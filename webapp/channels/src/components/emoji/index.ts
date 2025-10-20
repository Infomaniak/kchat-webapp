// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';
import {getCloudLimits} from 'mattermost-redux/selectors/entities/cloud';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getUsage} from 'mattermost-redux/selectors/entities/usage';
import {isQuotaExceeded} from 'mattermost-redux/utils/plans_util';

import EmojiPage from 'components/emoji/emoji_page';

import type {GlobalState} from 'types/store';

function mapStateToProps(state: GlobalState) {
    const team = getCurrentTeam(state);

    const usage = getUsage(state);
    const limit = getCloudLimits(state);
    const isEmojisExceeded = isQuotaExceeded(usage.custom_emojis, limit.custom_emojis);

    return {
        teamName: team?.name,
        teamDisplayName: team?.display_name,
        siteName: state.entities.general.config.SiteName,
        isQuotaExceeded: isEmojisExceeded,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            loadRolesIfNeeded,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiPage);
