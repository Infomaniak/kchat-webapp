// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {Post} from 'mattermost-redux/types/posts';

import {Client4} from 'mattermost-redux/client';

import {voiceConnectedChannels, voiceConnectedProfilesInChannel, connectedCallID} from 'selectors/calls';
import {showSwitchCallModal} from 'actions/calls';

import {ActionTypes} from 'utils/constants';
import {getCurrentChannelId, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {getUser} from 'mattermost-redux/selectors/entities/users';

import PostType from './component';

interface OwnProps {
    post: Post;
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    let hasCall = false;
    const connectedID = connectedCallID(state) || '';
    const channels = voiceConnectedChannels(state);

    let profiles = [];
    const pictures = [];
    if (channels) {
        // console.log(channels)
        // const users = channels[ownProps.post.channel_id][ownProps.post.props.conference_id];
        let users;
        if (channels[ownProps.post.channel_id] && channels[ownProps.post.channel_id][ownProps.post.props.conference_id]) {
            hasCall = true;
            users = channels[ownProps.post.channel_id][ownProps.post.props.conference_id];
        }

        // console.log(users)
        if (users && users.length > 0) {
            profiles = voiceConnectedProfilesInChannel(state, ownProps.post.channel_id, ownProps.post.props.conference_id);

            // console.log(profiles)
            for (let i = 0; i < profiles.length; i++) {
                const u = getUser(state, profiles[i]);
                if (u) {
                    pictures.push(Client4.getProfilePictureUrl(u.id, u.last_picture_update));
                } else if (profiles && profiles[i]) {
                    try {
                        profiles.splice(i, 1);
                    } catch {}
                }
            }
        }
    }
    return {
        ...ownProps,
        connectedID,
        hasCall,
        pictures,
        profiles,
    };
};

function onJoinCall(channelID: string, id: string) {
    return async (doDispatch, doGetState) => {
        if (!connectedChannelID(doGetState())) {
            const channels = voiceConnectedChannels(doGetState());
            doDispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });

            await doDispatch({
                type: ActionTypes.VOICE_CHANNEL_USER_CONNECTED,
                data: {
                    channelID: getCurrentChannelId(doGetState()),
                    userID: getCurrentUserId(doGetState()),
                    currentUserID: getCurrentUserId(doGetState()),
                    url: `https://kmeet.preprod.dev.infomaniak.ch/${channelID}`,
                    id,
                },
            });
        }
    };
}
function disconnect(channelID: string) {
    return (dispatch, getState) => {
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
    onJoinCall,
    disconnect,
    showSwitchCallModal,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PostType);
