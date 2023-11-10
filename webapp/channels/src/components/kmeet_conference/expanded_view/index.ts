// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {UserProfile} from '@mattermost/types/users';

import {Client4} from 'mattermost-redux/client';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, getUser} from 'mattermost-redux/selectors/entities/users';

import {hideExpandedView} from 'actions/calls';
import type {UserState} from 'reducers/views/calls';

import type {GlobalState} from 'types/store';

import ExpandedView from './component';

import {expandedView, voiceChannelCallStartAt, connectedChannelID, voiceConnectedProfiles, voiceUsersStatuses, voiceChannelScreenSharingID} from '../../selectors';
import {alphaSortProfiles, stateSortProfiles, isDMChannel, getUserIdFromDM} from '../utils';

const mapStateToProps = (state: GlobalState) => {
    const channel = getChannel(state, connectedChannelID(state));
    const screenSharingID = voiceChannelScreenSharingID(state, channel?.id) || '';

    const sortedProfiles = (profiles: UserProfile[], statuses: {[key: string]: UserState}) => {
        return [...profiles].sort(alphaSortProfiles(profiles)).sort(stateSortProfiles(profiles, statuses, screenSharingID));
    };

    const statuses = voiceUsersStatuses(state);
    const profiles = sortedProfiles(voiceConnectedProfiles(state), statuses);

    const pictures: {[key: string]: string} = {};
    for (let i = 0; i < profiles.length; i++) {
        pictures[String(profiles[i].id)] = Client4.getProfilePictureUrl(profiles[i].id, profiles[i].last_picture_update);
    }

    let connectedDMUser;
    if (channel && isDMChannel(channel)) {
        const otherID = getUserIdFromDM(channel.name, getCurrentUserId(state));
        connectedDMUser = getUser(state, otherID);
    }

    return {
        show: expandedView(state),
        currentUserID: getCurrentUserId(state),
        profiles,
        pictures,
        statuses,
        callStartAt: voiceChannelCallStartAt(state, channel?.id) || 0,
        channel,
        connectedDMUser,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    hideExpandedView,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ExpandedView);
