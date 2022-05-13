// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

import {showSwitchCallModal, startOrJoinCallInChannel} from 'actions/calls';
import {Client4} from 'mattermost-redux/client';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {Post} from 'mattermost-redux/types/posts';
import {GlobalState} from 'mattermost-redux/types/store';

import {connectedCallID, voiceConnectedChannels, voiceConnectedProfilesInChannel} from 'selectors/calls';

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

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    onJoinCall: startOrJoinCallInChannel,
    showSwitchCallModal,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PostType);
