// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import semver from 'semver';

import type {Channel} from '@mattermost/types/channels';

import {General} from 'mattermost-redux/constants';
import {getCurrentChannelId, getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';

import {suitePluginIds} from 'utils/constants';

import type {GlobalState} from 'types/store';

const CALLS_PLUGIN_KEY = 'plugins-com.mattermost.calls';

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
export function isCallsRingingEnabledOnServer(state: GlobalState): boolean {
    const plugin = (state as any)[CALLS_PLUGIN_KEY];
    return Boolean(plugin?.callsConfig?.EnableRinging);
}

export function getCallsChannelState(state: GlobalState, channelId: string): {enabled?: boolean} {
    const plugin = (state as any)[CALLS_PLUGIN_KEY];
    if (!plugin || !plugin.channels) {
        return {};
    }
    return plugin.channels[channelId] || {};
}

export function callsChannelExplicitlyEnabled(state: GlobalState, channelId: string) {
    return Boolean(getCallsChannelState(state, channelId).enabled);
}

export function callsChannelExplicitlyDisabled(state: GlobalState, channelId: string) {
    const enabled = getCallsChannelState(state, channelId).enabled;
    return (typeof enabled !== 'undefined') && !enabled;
}

export function canCallInChannel(state: GlobalState, channel?: Channel): boolean {
    if (!channel) {
        return false;
    }

    const isChannelArchived = channel.delete_at !== 0;
    if (isChannelArchived) {
        return false;
    }

    if (channel.type !== General.DM_CHANNEL) {
        return true;
    }

    const currentUser = getCurrentUser(state);
    const dmUserId = getUserIdFromChannelName(currentUser.id, channel.name);
    const dmUser = getUser(state, dmUserId);

    if (!dmUser) {
        return false;
    }

    return !dmUser.delete_at && !dmUser.is_bot && currentUser.id !== dmUser.id;
}
