// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getUser, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';

import {getIsMobileView} from 'selectors/views/browser';

import type {GlobalState} from 'types/store';

import UserProfile from './user_profile';

type OwnProps = {
    userId: string;
}

function makeMapStateToProps() {
    const getDisplayName = makeGetDisplayName();

    return (state: GlobalState, ownProps: OwnProps) => {
        const user = getUser(state, ownProps.userId);
        const theme = getTheme(state);

        return {
            displayName: getDisplayName(state, ownProps.userId, true),
            user,
            theme,
            isMobileView: getIsMobileView(state),
            isShared: Boolean(user && user.remote_id),
        };
    };
}

export default connect(makeMapStateToProps)(UserProfile);
