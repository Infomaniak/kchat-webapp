// old calls #1
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

// old-calls #2
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
