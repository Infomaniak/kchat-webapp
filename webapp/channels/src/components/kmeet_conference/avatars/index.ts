// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {Conference} from '@mattermost/types/conference';

import {getCurrentUser, makeGetProfilesByIdsAndUsernames} from 'mattermost-redux/selectors/entities/users';

import {getConferenceByChannelId, getConferenceParticipantsIds} from 'selectors/kmeet_calls';

import type {GlobalState} from 'types/store';

import KMeetAvatars from './kmeet_avatars';

type OwnProps = {
    channelId?: string;
    showCurrentUser?: boolean;
}

function makeMapStateToProps() {
    const getProfilesByIdsAndUsernames = makeGetProfilesByIdsAndUsernames();

    return (state: GlobalState, {channelId}: OwnProps) => {
        const currentUser = getCurrentUser(state);
        const conference = channelId ? getConferenceByChannelId(state, channelId) : {} as Conference;

        const conferenceParticipantsIds = channelId ? getConferenceParticipantsIds(state, channelId) : [];
        const conferenceParticipants = conferenceParticipantsIds.length > 0 ? getProfilesByIdsAndUsernames(state, {
            allUserIds: conferenceParticipantsIds,
            allUsernames: [],
        }) : [];

        return {
            conferenceParticipants,
            conference,
            currentUser,
        };
    };
}

export default connect(makeMapStateToProps)(KMeetAvatars);
