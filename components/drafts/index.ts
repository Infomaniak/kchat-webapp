// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUser, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';
import {localDraftsAreEnabled, getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {Permissions} from 'mattermost-redux/constants';

import {GlobalState} from 'types/store';

import {makeGetDrafts} from 'selectors/drafts';

import Drafts from './drafts';

function makeMapStateToProps() {
    const getDrafts = makeGetDrafts();
    return (state: GlobalState) => {
        const user = getCurrentUser(state);
        const status = getStatusForUserId(state, user.id);
        const drafts = getDrafts(state);
        const currentTeamId = getCurrentTeamId(state);
        const invalidScheduledAmount = drafts.reduce((acc, draft) => {
            const {channelId, timestamp} = draft.value;
            const isInvalid = !haveIChannelPermission(state, currentTeamId, channelId, Permissions.CREATE_POST);
            if (isInvalid && timestamp) {
                return acc + 1;
            }
            return acc;
        }, 0);

        return {
            displayName: displayUsername(user, getTeammateNameDisplaySetting(state)),
            drafts,
            status,
            user,
            localDraftsAreEnabled: localDraftsAreEnabled(state),
            invalidScheduledAmount,
        };
    };
}

export default connect(makeMapStateToProps)(Drafts);
