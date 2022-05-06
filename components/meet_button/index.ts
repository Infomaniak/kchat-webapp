// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {connectedCallID, connectedChannelID, voiceConnectedChannels, voiceConnectedUsers} from 'selectors/calls';

import {getCurrentChannelId, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {getProfilesByIds} from 'mattermost-redux/actions/users';

import {ActionTypes} from 'utils/constants';

import {Client4} from 'mattermost-redux/client';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {isDesktopApp} from 'utils/user_agent';

import MeetButton from './meet_button';

function startCallInChannel() {
    return async (dispatch: DispatchFunc, getState) => {
        const state = getState();
        const channelID = getCurrentChannelId(state);
        const channels = voiceConnectedChannels(state);
        let data;
        if (!connectedChannelID(getState()) && !channels[getCurrentChannelId(state)]) {
            data = await Client4.startMeet(channelID);
            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });
            await dispatch({
                type: ActionTypes.VOICE_CHANNEL_USER_CONNECTED,
                data: {
                    channelID,
                    userID: getCurrentUserId(getState()),
                    currentUserID: getCurrentUserId(getState()),
                    url: data.url,
                    id: data.id,
                },
            });
            try {
                const users = voiceConnectedUsers(state);
                if (users && users.length > 0) {
                    dispatch({
                        type: ActionTypes.VOICE_CHANNEL_PROFILES_CONNECTED,
                        data: {
                            profiles: await dispatch(getProfilesByIds(users)),
                            channelID,
                        },
                    });
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
                return;
            }
        } else if (!connectedChannelID(getState())) {
            data = {id: Object.keys(channels[channelID])[0]};
            await Client4.acceptIncomingMeetCall(data.id);
            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });
            await dispatch({
                type: ActionTypes.VOICE_CHANNEL_USER_CONNECTED,
                data: {
                    channelID,
                    userID: getCurrentUserId(getState()),
                    currentUserID: getCurrentUserId(getState()),
                    url: '',
                    id: data.id,
                },
            });
            try {
                const users = voiceConnectedUsers(state);
                if (users && users.length > 0) {
                    dispatch({
                        type: ActionTypes.VOICE_CHANNEL_PROFILES_CONNECTED,
                        data: {
                            profiles: await dispatch(getProfilesByIds(users)),
                            channelID,
                        },
                    });
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
                return;
            }
        }

        if (!isDesktopApp()) {
            window.onCloseJitsi = (window) => {
                window.close();
                Client4.leaveMeet(data.id);
                dispatch({
                    type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
                    data: {
                        channelID,
                        callID: data.id,
                        userID: getCurrentUserId(getState()),
                        currentUserID: getCurrentUserId(getState()),
                    },
                });
            };
            window.onParticipantJoined = (msg: {id: string; displayName: string}) => {
                // console.log(msg);
                dispatch({
                    type: ActionTypes.VOICE_CHANNEL_PROFILE_CONNECTED,
                    data: {
                        channelID: data.id,
                        profile: msg,
                    },
                });
            };

            window.callWindow = window.open(`/static/call.html?channelID=${data.id}`, 'ExpandedView', 'width=1100,height=800,left=200,top=200,resizable=yes');
            window.callWindow.onbeforeunload = () => {
                Client4.leaveMeet(data.id);
                dispatch({
                    type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
                    data: {
                        channelID,
                        userID: getCurrentUserId(getState()),
                        currentUserID: getCurrentUserId(getState()),
                        callID: data.id,
                    },
                });
            };
        }

        // else if (connectedChannelID(getState()) !== data.id) {
        //     window.callWindow.close();
        //     window.callWindow = window.open(`/static/call.html?channelID=${data.id}`, 'ExpandedView', 'width=1100,height=800,left=200,top=200,resizable=yes');
        // }
    };
}

function mapStateToProps(state: GlobalState) {
    // const connectedCall = connectedCallID(state) || '';
    // const connectedChannel = connectedChannelID(state);
    const channels = voiceConnectedChannels(state);

    return {
        currentChannelID: getCurrentChannelId(state),
        hasCall: channels[getCurrentChannelId(state)],
    };
}

const actions = {
    startCallInChannel,
};

export default connect(mapStateToProps, actions)(MeetButton);
