// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {getUser as selectUser} from 'mattermost-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

import UserAvatar from './user_avatar';

type OwnProps = {
    userId: string;
    user?: UserProfile;
    name?: string | undefined;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    let user;
    let name;

    if (ownProps.user) {
        user = ownProps.user;
        name = ownProps.name;
    } else {
        user = selectUser(state, ownProps.userId);
    }

    return {
        user,
        name,
    };
};

export default connect(mapStateToProps)(UserAvatar);
