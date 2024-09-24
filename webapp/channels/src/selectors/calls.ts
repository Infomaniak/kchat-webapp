// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import semver from 'semver';

import {getCurrentChannelId, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {suitePluginIds} from 'utils/constants';

import type {GlobalState} from 'types/store';

export const connectedChannelID = (state: GlobalState) => state.views.calls.connectedChannelID;
export const connectedCallID = (state: GlobalState) => state.views.calls.connectedCallID;
export const connectedCallUrl = (state: GlobalState) => state.views.calls.connectedCallUrl;
export const voiceConnectedChannels = (state: GlobalState) => state.views.calls.voiceConnectedChannels;

export const usersInCall = (state: GlobalState) => state.views.calls.callParameters.users;
export const userCalling = (state: GlobalState) => state.views.calls.callParameters.caller;
export const channelInCall = (state: GlobalState) => state.views.calls.callParameters.channel;
export const callConferenceId = (state: GlobalState) => state.views.calls.callParameters.msg.id;
export const callMessage = (state: GlobalState) => state.views.calls.callParameters.msg;

export const userStatus = (state: GlobalState) => state.entities.users.statuses;

export const callParameters = (state: GlobalState) => {
    return {
        users: usersInCall(state).filter((usr) => usr.id !== getCurrentUserId(state)),
        caller: userCalling(state),
        channel: channelInCall(state),
        msg: callMessage(state),
    };
};

export const callUserStatus = (state: GlobalState) => {
    return {
        status: userStatus(state),
    };
};

export const voiceConnectedUsers = (state: GlobalState) => {
    const currentChannelID = getCurrentChannelId(state);
    const channels = voiceConnectedChannels(state);
    if (channels && channels[currentChannelID]) {
        return channels[currentChannelID];
    }
    return [];
};

export const voiceConnectedProfiles = (state: GlobalState) => {
    if (!state.views.calls.voiceConnectedProfiles) {
        return [];
    }
    return state.views.calls.voiceConnectedProfiles[connectedChannelID(state)] || [];
};

export const voiceConnectedProfilesInChannel = (state: GlobalState, channelID: string, callID: string) => {
    if (!state.views.calls.voiceConnectedProfiles) {
        return [];
    }
    return state.views.calls.voiceConnectedChannels[channelID][callID] || [];
};

export const voiceUsersStatuses = (state: GlobalState) => {
    return state.views.calls.voiceUsersStatuses[connectedCallID(state)] || {};
};

export const voiceChannelCallStartAt = (state: GlobalState, channelID: string) => {
    return state.views.calls.callStartAt[channelID];
};

export const expandedView = (state: GlobalState) => {
    return state.views.calls.expandedView;
};

export const switchCallModal = (state: GlobalState) => {
    return state.views.calls.switchCallModal;
};

export function isCallsEnabled(state: GlobalState, minVersion = '0.4.2') {
    return Boolean(state.plugins.plugins[suitePluginIds.calls] &&
        semver.gte(String(semver.clean(state.plugins.plugins[suitePluginIds.calls].version || '0.0.0')), minVersion));
}

// isCallsRingingEnabledOnServer is the flag for the ringing/notification feature in calls
export function isCallsRingingEnabledOnServer(state: GlobalState) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Boolean(state[CALLS_PLUGIN]?.callsConfig?.EnableRinging);
}

// export function getSessionsInCalls(state: GlobalState): Record<string, Record<string, UserSessionState>> {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     return state[CALLS_PLUGIN]?.sessions || {};
// }

// export function getCallsConfig(state: GlobalState): CallsConfig {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     return state[CALLS_PLUGIN]?.callsConfig;
// }

export function getCallsChannelState(state: GlobalState, channelId: string): {enabled?: boolean} {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!state[CALLS_PLUGIN] || !state[CALLS_PLUGIN].channels) {
        return {};
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return state[CALLS_PLUGIN].channels[channelId] || {};
}

export function callsChannelExplicitlyEnabled(state: GlobalState, channelId: string) {
    return Boolean(getCallsChannelState(state, channelId).enabled);
}

export function callsChannelExplicitlyDisabled(state: GlobalState, channelId: string) {
    const enabled = getCallsChannelState(state, channelId).enabled;
    return (typeof enabled !== 'undefined') && !enabled;
}
