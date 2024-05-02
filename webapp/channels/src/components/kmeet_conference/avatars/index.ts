// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getUserById} from 'mattermost-redux/selectors/entities/users';

import {getConferenceByChannelId} from 'selectors/kmeet_calls';

import type {GlobalState} from 'types/store';

import Avatars from './avatars';

type OwnProps = {
    channelId: string;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    const conference = getConferenceByChannelId(state, ownProps.channelId);
    const caller = getUserById(state, conference.user_id);

    return {
        conference,
        caller,
    };
};

export default connect(mapStateToProps)(Avatars);
