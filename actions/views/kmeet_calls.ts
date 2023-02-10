// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {ActionTypes} from 'utils/constants';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {Client4} from 'mattermost-redux/client';
import {GlobalState} from 'types/store';
import {connectedKmeetCallUrl, connectedKmeetChannels} from 'selectors/kmeet_calls';

export function startOrJoinKmeetCallInChannel(channelID: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const channels = Object.keys(connectedKmeetChannels(state));

        let data;
        let kmeetUrl;
        if (channels.indexOf(channelID) === -1) {
            data = await Client4.startMeet(channelID);

            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ENABLE,
            });

            dispatch({
                type: ActionTypes.VOICE_CHANNEL_ADDED,
                data: {
                    channelID,
                    userID: getCurrentUserId(getState()),
                    currentUserID: getCurrentUserId(getState()),
                    url: data.url,
                    id: data.id,
                },
            });

            if (data && data.url) {
                kmeetUrl = new URL(data.url);
            }
        } else if (connectedKmeetCallUrl(state, channelID) !== null) {
            kmeetUrl = new URL(connectedKmeetCallUrl(state, channelID));
        }

        if (kmeetUrl) {
            window.open(kmeetUrl.href, '_blank', 'noopener');
        }
    };
}
