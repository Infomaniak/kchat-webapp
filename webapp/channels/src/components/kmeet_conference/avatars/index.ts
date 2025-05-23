// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {Conference} from '@mattermost/types/conference';

import {getConferenceByChannelId} from 'mattermost-redux/selectors/entities/kmeet_calls';
import {getCurrentUser, makeGetProfilesByIdsAndUsernames} from 'mattermost-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

import KMeetAvatars from './avatars';

type OwnProps = {
    channelId?: string;
    showCurrentUser?: boolean;
}
function makeMapStateToProps() {
    const getProfilesByIdsAndUsernames = makeGetProfilesByIdsAndUsernames();

    return (state: GlobalState, ownProps: OwnProps) => {
        const currentUser = getCurrentUser(state);
        const conference = ownProps.channelId ? getConferenceByChannelId(state, ownProps.channelId) : {} as Conference;
        let conferenceParticipants;
        if (conference && conference.registrants) {
            const ids = Object.keys(conference.registrants);
            let finalIds: string[] = ids;
            if (currentUser && !ownProps.showCurrentUser) {
                finalIds = ids.filter((id) => id !== currentUser.id);
            }
            conferenceParticipants = getProfilesByIdsAndUsernames(state, {allUserIds: finalIds, allUsernames: []});
        }

        return {
            conferenceParticipants,
            conference,
            currentUser,
        };
    };
}

export default connect(makeMapStateToProps)(KMeetAvatars);
