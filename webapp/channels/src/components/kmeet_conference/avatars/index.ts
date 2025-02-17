// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConferenceByChannelId} from 'mattermost-redux/selectors/entities/kmeet_calls';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

import Avatars from './avatars';

type OwnProps = {
    channelId: string;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    const conference = getConferenceByChannelId(state, ownProps.channelId);
    const currentUser = getCurrentUser(state);

    return {
        conference,
        currentUser,
    };
};

export default connect(mapStateToProps)(Avatars);
