// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Dispatch} from 'redux';

import {DispatchFunc, GenericAction} from 'mattermost-redux/types/actions';
import {ActionTypes} from 'utils/constants';
import {connectedChannelID, voiceConnectedUsers} from 'selectors/calls';
import {getProfilesByIds} from 'mattermost-redux/actions/users';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

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

export function startCallInChannel(channelID: string) {
    return async (dispatch: DispatchFunc, getState) => {
        const state = getState();

        // const data = await Client4.startMeet(channelID);

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

        if (!connectedChannelID(getState())) {
            // const channel = getCurrentChannel(state);
            // const team = getCurrentTeam(state);

            // browserHistory.push(`${getTeamRelativeUrl(team)}/${isDMChannel(channel) ? 'messages' : 'channels'}/${channel.name}/call`);

            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });
            await dispatch({
                type: ActionTypes.VOICE_CHANNEL_USER_CONNECTED,
                data: {
                    channelID,
                    userID: getCurrentUserId(getState()),
                    currentUserID: getCurrentUserId(getState()),
                    url: `https://kmeet.preprod.dev.infomaniak.ch/${channelID}`,
                },
            });
        }

        // else if (connectedChannelID(getState()) !== channelID) {
        //     dispatch({
        //         type: ActionTypes.SHOW_SWITCH_CALL_MODAL,
        //     });
        // }
    };
}
