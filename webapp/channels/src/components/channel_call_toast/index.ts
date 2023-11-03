// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {Action} from 'mattermost-redux/types/actions';

import {getUser} from 'mattermost-redux/selectors/entities/users';

import {voiceConnectedChannels, voiceConnectedProfilesInChannel, connectedChannelID, voiceChannelCallStartAt, connectedCallID} from 'selectors/calls';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {Client4} from 'mattermost-redux/client';

import {startOrJoinCallInChannelV2} from 'actions/calls';

import ChannelCallToast from './component';

const mapStateToProps = (state: GlobalState) => {
    let hasCall = false;
    const currentID = getCurrentChannelId(state);
    const connectedID = connectedChannelID(state) || '';
    const channels = voiceConnectedChannels(state);
    const connectedConfID = connectedCallID(state);

    let profiles = [];
    const pictures = [];
    if (channels) {
        let users;
        if (channels[currentID]) {
            hasCall = true;
            users = channels[currentID][connectedConfID] || [];
        }

        if (users && users.length > 0) {
            profiles = voiceConnectedProfilesInChannel(state, currentID, connectedConfID);

            // console.log(profiles)
            for (let i = 0; i < profiles.length; i++) {
                const u = getUser(state, profiles[i]);
                if (u) {
                    pictures.push(Client4.getProfilePictureUrl(u.id, u.last_picture_update));
                } else if (profiles && profiles[i]) {
                    try {
                        profiles.splice(i, 1);
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                    }
                }
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

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators<ActionCreatorsMapObject<Action>, any>({
    startOrJoinCallInChannelV2,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ChannelCallToast);
