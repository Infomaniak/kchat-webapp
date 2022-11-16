// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Dispatch} from 'redux';

import {DispatchFunc, GenericAction, GetStateFunc} from 'mattermost-redux/types/actions';
import {ActionTypes} from 'utils/constants';
import {
    connectedCallID,
    connectedCallUrl,
    connectedChannelID,
    voiceConnectedChannels,
    voiceConnectedUsers,
} from 'selectors/calls';
import {getProfilesByIds} from 'mattermost-redux/actions/users';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {Client4} from 'mattermost-redux/client';
import {isDesktopApp} from 'utils/user_agent';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'types/store';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {displayUsername} from 'mattermost-redux/utils/user_utils';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {IKConstants} from '../utils/constants-ik';

// import {Client4} from 'mattermost-redux/client';

export const showExpandedView = () => (dispatch: Dispatch<GenericAction>) => {
    dispatch({
        type: ActionTypes.SHOW_EXPANDED_VIEW,
    });
};

export const hideExpandedView = () => (dispatch: Dispatch<GenericAction>) => {
    dispatch({
        type: ActionTypes.HIDE_EXPANDED_VIEW,
    });
};

export const showSwitchCallModal = (targetID?: string) => (dispatch: Dispatch<GenericAction>) => {
    dispatch({
        type: ActionTypes.SHOW_SWITCH_CALL_MODAL,
        data: {
            targetID,
        },
    });
};

export const hideSwitchCallModal = () => (dispatch: Dispatch<GenericAction>) => {
    dispatch({
        type: ActionTypes.HIDE_SWITCH_CALL_MODAL,
    });
};

export function leaveCallInChannel(channelID: string, dialingID: string) {
    return async (dispatch: DispatchFunc, getState) => {
        Client4.leaveMeet(dialingID);
        dispatch({
            type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
            data: {
                channelID,
                userID: getCurrentUserId(getState()),
                currentUserID: getCurrentUserId(getState()),
                callID: dialingID,
            },
        });
    };
}

export function startOrJoinCallInChannel(channelID: string, dialingID?: string) {
    return async (dispatch: DispatchFunc, getState) => {
        const state = getState();
        const currentUser = getCurrentUser(getState());
        const getChannel = makeGetChannel();
        const currentChannel = getChannel(state, {id: channelID});
        const channelName = currentChannel.display_name.length > 30 ? `${currentChannel.display_name.substring(0, 30)}...` : currentChannel.display_name;
        const channels = voiceConnectedChannels(state);
        let data;
        if (!connectedChannelID(getState()) && !channels[channelID]) {
            data = await Client4.startMeet(channelID);
            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });
console.log(IKConstants.KMEET_ENDPOINT)
            if (data && data.url) {
                const kmeetUrl = new URL(`${IKConstants.KMEET_ENDPOINT}/${data.id}`);

                console.log(kmeetUrl)
                window.open(kmeetUrl.href, '_blank', 'noopener');
            }

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

            /*try {
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
            }*/
        } else if (connectedCallUrl(state) !== null) {
            const kmeetUrl = new URL(connectedCallUrl(state));
            console.log(kmeetUrl)
            window.open(kmeetUrl.href, '_blank', 'noopener');
        }

        /*else if (!connectedChannelID(getState())) {
            data = {id: Object.keys(channels[dialingID || channelID])[0]};
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
            }
        }*/

        /*
        function getBase64Image(img: any) {
            const canvas = document.createElement('canvas');
            const image = new Image(img);
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(image, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
        }
*/

        /*
        const username = displayUsername(currentUser, getTeammateNameDisplaySetting(getState()));
        const avartarUrl = getBase64Image(Client4.getProfilePictureUrl(currentUser.id, currentUser.last_picture_update)); // Convert avatar url in base64
*/

        /*        if (!isDesktopApp()) {
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
                dispatch({
                    type: ActionTypes.VOICE_CHANNEL_PROFILE_CONNECTED,
                    data: {
                        channelID: data.id,
                        profile: msg,
                    },
                });
            };*/

        /*            const channel = getChannel(getState(), {id: channelID});
            const windowFeatures = 'width=1100,height=800,left=200,top=200,resizable=yes';
            let qParams = `?channelID=${data.id}&channelName=${channel.display_name}`;
            if (currentUser) {
                qParams = qParams.concat('', `&username=${username}&avatarUrl=${avartarUrl}`);
            }
            window.callWindow = window.open(`/static/call.html${qParams}`, 'ExpandedView', windowFeatures);
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

            return;
        }*/
        /*
        const me = getCurrentUser(getState());
        const channel = getChannel(getState(), {id: channelID});
*/

        /*        window.postMessage(
            {
                type: 'call-joined',
                message: {
                    url: data?.url,
                    id: data?.id,
                    name: channel.display_name,
                    avatar: Client4.getProfilePictureUrl(me.id, me.last_picture_update),
                    username: me.nickname,
                },
            },
            window.origin,
        );*/

        /*   window.addEventListener('message', ({origin, data: {type, message = {}} = {}} = {}) => {
            if (origin !== window.location.origin) {
                return;
            }

            switch (type) {
            case 'call-closed': {
                if (connectedCallID(getState())) {
                    Client4.leaveMeet(message.id);
                }
                dispatch({
                    type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
                    data: {
                        channelID,
                        userID: getCurrentUserId(getState()),
                        currentUserID: getCurrentUserId(getState()),
                        callID: message.id,
                    },
                });
                break;
            }
            case 'call-audio-status-change': {
                const muted = message.status;
                dispatch({
                    type: muted ? ActionTypes.VOICE_CHANNEL_USER_MUTED : ActionTypes.VOICE_CHANNEL_USER_UNMUTED,
                    data: {
                        userID: getCurrentUserId(getState()),
                        callID: connectedCallID(getState()),
                    },
                });
                break;
            }
            case 'call-video-status-change': {
                const muted = message.status;
                dispatch({
                    type: muted ? ActionTypes.VOICE_CHANNEL_USER_VIDEO_OFF : ActionTypes.VOICE_CHANNEL_USER_VIDEO_ON,
                    data: {
                        userID: getCurrentUserId(getState()),
                        callID: connectedCallID(getState()),
                    },
                });
                break;
            }
            case 'call-ss-status-change': {
                const on = message.status;
                dispatch({
                    type: on ? ActionTypes.VOICE_CHANNEL_USER_SCREEN_OFF : ActionTypes.VOICE_CHANNEL_USER_SCREEN_ON,
                    data: {
                        userID: getCurrentUserId(getState()),
                        callID: connectedCallID(getState()),
                    },
                });
            }
            }
        });*/
    };
}

export function updateAudioStatus(dialingID: string, muted = false) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        dispatch({
            type: muted ? ActionTypes.VOICE_CHANNEL_USER_MUTED : ActionTypes.VOICE_CHANNEL_USER_UNMUTED,
            data: {
                userID: getCurrentUserId(getState()),
                callID: connectedCallID(getState()),
            },
        });
    };
}

export function updateCameraStatus(dialingID: string, muted = false) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        dispatch({
            type: muted ? ActionTypes.VOICE_CHANNEL_USER_VIDEO_OFF : ActionTypes.VOICE_CHANNEL_USER_VIDEO_ON,
            data: {
                userID: getCurrentUserId(getState()),
                callID: connectedCallID(getState()),
            },
        });
    };
}
export function updateScreenSharingStatus(dialingID: string, muted = false) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        dispatch({
            type: muted ? ActionTypes.VOICE_CHANNEL_USER_SCREEN_OFF : ActionTypes.VOICE_CHANNEL_USER_SCREEN_ON,
            data: {
                userID: getCurrentUserId(getState()),
                callID: connectedCallID(getState()),
            },
        });
    };
}
