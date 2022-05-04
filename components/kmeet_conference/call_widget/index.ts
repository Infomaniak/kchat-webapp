// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {UserProfile} from 'mattermost-redux/types/users';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeam, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {Client4} from 'mattermost-redux/client';

import {connectedChannelID, voiceConnectedProfiles, voiceUsersStatuses, voiceChannelCallStartAt, expandedView} from 'selectors/calls';

// import {getChannelURL, alphaSortProfiles, stateSortProfiles} from '../../utils';

import {getChannelURL, alphaSortProfiles, stateSortProfiles} from '../utils';
import {showExpandedView, hideExpandedView} from 'actions/calls';

import {UserState} from 'reducers/views/calls';

import {ActionTypes} from 'utils/constants';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import CallWidget from './component';

const mapStateToProps = (state: GlobalState) => {
    const channel = getChannel(state, connectedChannelID(state));

    const sortedProfiles = (profiles: UserProfile[], statuses: {[key: string]: UserState}) => {
        return [...profiles].sort(alphaSortProfiles()).sort(stateSortProfiles(statuses, ''));
    };

    const statuses = voiceUsersStatuses(state);
    const profiles = sortedProfiles(voiceConnectedProfiles(state), statuses);

    const profilesMap: IDMappedObjects<UserProfile> = {};
    const picturesMap: {
        [key: string]: string;
    } = {};
    for (let i = 0; i < profiles.length; i++) {
        const pic = Client4.getProfilePictureUrl(profiles[i].id, profiles[i].last_picture_update);
        picturesMap[profiles[i].id] = pic;
        profilesMap[profiles[i].id] = profiles[i];
    }

    let channelURL = '';
    if (channel) {
        channelURL = getChannelURL(state, channel, channel.team_id);
    }

    return {
        currentUserID: getCurrentUserId(state),
        channel,
        team: getTeam(state, getCurrentTeamId(state)),
        channelURL,
        profiles,
        profilesMap,
        picturesMap,
        statuses: voiceUsersStatuses(state) || {},
        callStartAt: voiceChannelCallStartAt(state, channel?.id) || 0,
        show: !expandedView(state),
    };
};

function disconnect(channelID: string) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({
            type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
            data: {
                channelID,
                userID: getCurrentUserId(getState()),
                currentUserID: getCurrentUserId(getState()),
            },
        });
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    showExpandedView,
    hideExpandedView,
    disconnect,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CallWidget);

