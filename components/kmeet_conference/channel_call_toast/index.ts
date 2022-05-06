// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {voiceConnectedChannels, voiceConnectedProfilesInChannel, connectedChannelID, voiceChannelCallStartAt} from 'selectors';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {Client4} from 'mattermost-redux/client';

import {GlobalState} from 'types/store';

import ChannelCallToast from './component';

const mapStateToProps = (state: GlobalState) => {
    let hasCall = false;
    const currentID = getCurrentChannelId(state);
    const connectedID = connectedChannelID(state);
    const channels = voiceConnectedChannels(state);

    let profiles = [];
    const pictures = [];
    if (currentID !== connectedID && channels) {
        const users = channels[currentID];
        if (users && users.length > 0) {
            hasCall = true;
            profiles = voiceConnectedProfilesInChannel(state, currentID);
            for (let i = 0; i < profiles.length; i++) {
                pictures.push(Client4.getProfilePictureUrl(profiles[i].id, profiles[i].last_picture_update));
            }
        }
    }
    return {
        currChannelID: currentID,
        connectedID,
        hasCall,
        startAt: voiceChannelCallStartAt(state, currentID),
        pictures,
        profiles,
    };
};

export default connect(mapStateToProps)(ChannelCallToast);
