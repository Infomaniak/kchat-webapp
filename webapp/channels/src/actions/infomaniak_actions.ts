
import {Preferences} from 'mattermost-redux/constants';
import {getCurrentChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {getConfig, isPerformanceDebuggingEnabled} from 'mattermost-redux/selectors/entities/general';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import type {ActionFuncAsync} from 'mattermost-redux/types/actions';

import store from 'stores/redux_store';

import * as Utils from 'utils/utils';

import WebSocketClient from 'client/web_websocket_client';

const dispatch = store.dispatch;

export function emitLocalUserRecordingEvent(channelId: string, parentPostId: string) {
    let lastTimeRecordingSent = 0;

    const userRecording: ActionFuncAsync = async (actionDispatch, actionGetState) => {
        const state = actionGetState();
        const config = getConfig(state);

        if (
            isPerformanceDebuggingEnabled(state) &&
            getBool(state, Preferences.CATEGORY_PERFORMANCE_DEBUGGING, Preferences.NAME_DISABLE_RECORDING_MESSAGES)
        ) {
            return {data: false};
        }

        const t = Date.now();
        const stats = getCurrentChannelStats(state);
        const userId = getCurrentUserId(state);
        const membersInChannel = stats ? stats.member_count : 0;

        const timeBetweenUserRecordingUpdatesMilliseconds = Utils.stringToNumber(config.TimeBetweenUserRecordingUpdatesMilliseconds);
        const maxNotificationsPerChannel = Utils.stringToNumber(config.MaxNotificationsPerChannel);

        if (((t - lastTimeRecordingSent) > timeBetweenUserRecordingUpdatesMilliseconds) &&
            (membersInChannel < maxNotificationsPerChannel) && (config.EnableUserRecordingMessages !== 'false')) {
            WebSocketClient.userRecording(channelId, userId, parentPostId);
            lastTimeRecordingSent = t;
        }

        return {data: true};
    };

    return dispatch(userRecording);
}
