// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {GlobalState} from 'types/store';

export const connectedChannelID = (state: GlobalState) => state.views.calls.connectedChannelID;
export const voiceConnectedChannels = (state: GlobalState) => state.views.calls.voiceConnectedChannels;

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

export const voiceConnectedProfilesInChannel = (state: GlobalState, channelID: string) => {
    if (!state.views.calls.voiceConnectedProfiles) {
        return [];
    }
    return state.views.calls.voiceConnectedProfiles[channelID] || [];
};

export const voiceUsersStatuses = (state: GlobalState) => {
    return state.views.calls.voiceUsersStatuses[connectedChannelID(state)] || {};
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

