// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import type {ServerChannel} from '@mattermost/types/channels';
import type {Call} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import type {GenericAction} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';

export type UserState = {
    voice: boolean;
    unmuted: boolean;
    raised_hand: number;
}

const isVoiceEnabled = (state = false, action: {type: string}) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return false;
    case ActionTypes.VOICE_CHANNEL_ENABLE:
        return true;
    case ActionTypes.VOICE_CHANNEL_DISABLE:
        return false;
    default:
        return state;
    }
};

export interface ConnectedProfilesState {
    [channelID: string]: UserProfile[];
}

export interface ConnectedAction {
    type: string;
    data: {
        channelID: string;
        userID?: string;
        profile?: UserProfile;
        profiles?: UserProfile[];
        currentUserID: string;
        id: number;
        url: string;
        callID: number;
        users: any;
    };
}

const voiceConnectedProfiles = (state: ConnectedProfilesState = {}, action: ConnectedAction) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return {};
    case ActionTypes.VOICE_CHANNEL_PROFILES_CONNECTED:
        return {
            ...state,
            [action.data.channelID]: action.data.profiles,
        };
    case ActionTypes.VOICE_CHANNEL_PROFILE_CONNECTED:
        if (!state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: [action.data.profile],
            };
        }
        return {
            ...state,
            [action.data.channelID]: [
                ...state[action.data.channelID],
                action.data.profile,
            ],
        };
    case ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED:
        return {
            ...state,
            [action.data.channelID]: state[action.data.channelID]?.filter((val) => val.id !== action.data.userID),
        };
    default:
        return state;
    }
};

export interface ConnectedChannelsState {
    [channelID: string]: string[];
}

const voiceConnectedChannels = (state: ConnectedChannelsState = {}, action: ConnectedAction) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return {};
    case ActionTypes.VOICE_CHANNEL_USER_CONNECTED:
        if (!state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: {
                    [action.data.id]: [action.data.userID],
                },
            };
        }
        if (action.data.userID && state[action.data.channelID][action.data.id].indexOf(action.data.userID) === -1) {
            return {
                ...state,
                [action.data.channelID]: {
                    ...state[action.data.channelID],
                    [action.data.id]: [
                        ...state[action.data.channelID][action.data.id],
                        action.data.userID,
                    ],
                },
            };
        }
        return state;
    case ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED: {
        const chan = state[action.data.channelID];
        if (chan) {
            let callChan = chan[action.data.callID] as any;
            if (callChan) {
                callChan = callChan.filter((val: any) => val !== action.data.userID);
                return {
                    ...state,
                    [action.data.channelID]: {
                        ...state[action.data.channelID],
                        [action.data.callID]: callChan,
                    },
                };
            }
        }
        return state;
    }
    case ActionTypes.VOICE_CHANNEL_USERS_CONNECTED:
        return {
            ...state,
            [action.data.channelID]: {
                [action.data.id]: Object.values(action.data.users),
            },
        };
    case ActionTypes.VOICE_CHANNEL_ADDED:
        return {
            ...state,
            [action.data.channelID]: {
                [action.data.id]: [action.data.userID],
            },
        };
    case ActionTypes.VOICE_CHANNEL_DELETED: {
        const chan = state[action.data.channelID];

        if (chan) {
            const callChan = chan[action.data.callID];
            const filteredCallsIds = Object.entries(chan).filter(([key]) => key !== action.data.callID.toString());

            const newstate = {
                [action.data.channelID]: filteredCallsIds.length > 0 ? Object.fromEntries(filteredCallsIds) : undefined,
            };

            if (callChan) {
                return newstate;
            }
        }
        return state;
    }
    default:
        return state;
    }
};

const connectedChannelID = (state: string | null = null, action: ConnectedAction) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
    case ActionTypes.VOICE_CHANNEL_DELETED:
        return null;
    case ActionTypes.VOICE_CHANNEL_USER_CONNECTED:
        if (action.data.currentUserID === action.data.userID) {
            return action.data.channelID;
        }
        return state;
    case ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED:
        if (action.data.currentUserID === action.data.userID) {
            return null;
        }
        return state;
    default:
        return state;
    }
};

const connectedCallID = (state: string | null = null, action: ConnectedAction) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return null;
    case ActionTypes.VOICE_CHANNEL_USER_CONNECTED:
        if (action.data.currentUserID === action.data.userID) {
            return action.data.id;
        }
        return state;
    case ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED:
        if (action.data.currentUserID === action.data.userID) {
            return null;
        }
        return state;
    default:
        return state;
    }
};

const connectedCallUrl = (state: string | null = null, action: ConnectedAction) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return null;
    case ActionTypes.VOICE_CHANNEL_USER_CONNECTED:
    case ActionTypes.VOICE_CHANNEL_USERS_CONNECTED:
    case ActionTypes.VOICE_CHANNEL_ADDED:
        return action.data.url;
    case ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED:
    case ActionTypes.VOICE_CHANNEL_DELETED:
        return null;
    default:
        return state;
    }
};

export interface UsersStatusesState {
    [channelID: string]: {
        [userID: string]: UserState;
    };
}

export interface UsersStatusesAction {
    type: string;
    data: {
        channelID: string;
        raised_hand?: number;
        states: {[userID: string]: UserState};
        id: string;
        userID: string;
        currentUserID: string;
        callID: string;
    };
}

const voiceUsersStatuses = (state: UsersStatusesState = {}, action: UsersStatusesAction) => {
    switch (action.type) {
    // case ActionTypes.VOICE_CHANNEL_UNINIT:
    //     return {};
    case ActionTypes.VOICE_CHANNEL_USER_CONNECTED:
    case ActionTypes.VOICE_CHANNEL_ADDED:
        if (!state[action.data.id]) {
            return {
                ...state,
                [action.data.id]: {
                    [action.data.userID]: {
                        muted: true,
                        voice: false,
                        screenshare: false,
                    },
                },
            };
        }

        // if (action.data.userID && Object.keys(state[action.data.id]).indexOf(action.data.userID) === -1) {
        //     return {
        //         ...state,
        //         [action.data.id]: {
        //             ...state[action.data.id],
        //             [action.data.userID]: {},
        //         },
        //     };
        // }
        return state;
    case ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED: {
        /*const call = state[action.data.callID];
        if (call) {
            const newCall = Object.entries(call).filter(([key, val]) => key !== action.data.userID);
            return {
                ...state,
                [action.data.callID]: Object.fromEntries(newCall),
            };
        }*/
        if (action.data.currentUserID === action.data.userID) {
            return {};
        }
        return state;
    }
    case ActionTypes.VOICE_CHANNEL_DELETED: {
        if (action.data.callID) {
            /*
            const filteredCallsIds = Object.entries(state).filter(([key, val]) => key !== action.data.callID);
            return filteredCallsIds.length > 0 ? Object.fromEntries(filteredCallsIds) : {};
*/
            return {};
        }
        return state;
    }

    // case ActionTypes.VOICE_CHANNEL_USERS_CONNECTED_STATES:
    //     return {
    //         ...state,
    //         [action.data.channelID]: action.data.states,
    //     };
    case ActionTypes.VOICE_CHANNEL_USER_MUTED:
        return {
            ...state,
            [action.data.callID]: {
                ...state[action.data.callID],
                [action.data.userID]: {
                    ...state[action.data.callID][action.data.userID],
                    muted: true,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_UNMUTED:
        return {
            ...state,
            [action.data.callID]: {
                ...state[action.data.callID],
                [action.data.userID]: {
                    ...state[action.data.callID][action.data.userID],
                    muted: false,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_VIDEO_ON:
        return {
            ...state,
            [action.data.callID]: {
                ...state[action.data.callID],
                [action.data.userID]: {
                    ...state[action.data.callID][action.data.userID],
                    video: true,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_VIDEO_OFF:
        return {
            ...state,
            [action.data.callID]: {
                ...state[action.data.callID],
                [action.data.userID]: {
                    ...state[action.data.callID][action.data.userID],
                    video: false,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_SCREEN_ON:
        return {
            ...state,
            [action.data.callID]: {
                ...state[action.data.callID],
                [action.data.userID]: {
                    ...state[action.data.callID][action.data.userID],
                    screenshare: false,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_SCREEN_OFF:
        return {
            ...state,
            [action.data.callID]: {
                ...state[action.data.callID],
                [action.data.userID]: {
                    ...state[action.data.callID][action.data.userID],
                    screenshare: true,
                },
            },
        };

    // case ActionTypes.VOICE_CHANNEL_USER_RAISE_HAND:
    //     if (!state[action.data.channelID]) {
    //         return {
    //             ...state,
    //             [action.data.channelID]: {
    //                 [action.data.userID]: {
    //                     unmuted: false,
    //                     voice: false,
    //                 },
    //             },
    //         };
    //     }
    //     return {
    //         ...state,
    //         [action.data.channelID]: {
    //             ...state[action.data.channelID],
    //             [action.data.userID]: {
    //                 ...state[action.data.channelID][action.data.userID],
    //                 raised_hand: action.data.raised_hand,
    //             },
    //         },
    //     };
    // case ActionTypes.VOICE_CHANNEL_USER_UNRAISE_HAND:
    //     if (!state[action.data.channelID]) {
    //         return {
    //             ...state,
    //             [action.data.channelID]: {
    //                 [action.data.userID]: {
    //                     voice: false,
    //                     unmuted: false,
    //                     raised_hand: action.data.raised_hand,
    //                 },
    //             },
    //         };
    //     }
    //     return {
    //         ...state,
    //         [action.data.channelID]: {
    //             ...state[action.data.channelID],
    //             [action.data.userID]: {
    //                 ...state[action.data.channelID][action.data.userID],
    //                 raised_hand: action.data.raised_hand,
    //             },
    //         },
    //     };
    default:
        return state;
    }
};

const callStartAt = (state: {[channelID: string]: number} = {}, action: {type: string; data: {channelID: string; startAt: number}}) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return {};
    case ActionTypes.VOICE_CHANNEL_CALL_START:
        return {
            ...state,
            [action.data.channelID]: action.data.startAt,
        };
    default:
        return state;
    }
};

const callParameters = (
    state: {users: UserProfile[]; caller: UserProfile; channel: ServerChannel; msg: Call} = {users: [], caller: {} as any, channel: {}as any, msg: {}as any},
    action: GenericAction) => {
    switch (action.type) {
    case ActionTypes.CALL_USERS_IN_CONF:
        return {
            ...state, users: action.data,
        };
    case ActionTypes.CALL_CALLING_USER:
        return {
            ...state, caller: action.data[0],
        };
    case ActionTypes.CALL_CONF_CHANNEL:
        return {
            ...state, channel: action.data,
        };
    case ActionTypes.CALL_RECEIVED:
        return {
            ...state, msg: action.data.msg,
        };
    default:
        return state;
    }
};
const voiceChannelScreenSharingID = (state: {[channelID: string]: string} = {}, action: {type: string; data: {channelID: string; userID?: string}}) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return {};
    case ActionTypes.VOICE_CHANNEL_USER_SCREEN_ON:
        return {
            ...state,
            [action.data.channelID]: action.data.userID,
        };
    case ActionTypes.VOICE_CHANNEL_USER_SCREEN_OFF:
        return {
            ...state,
            [action.data.channelID]: '',
        };
    default:
        return state;
    }
};

const expandedView = (state = true, action: {type: string}) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return true;
    case ActionTypes.SHOW_EXPANDED_VIEW:
        return false;
    case ActionTypes.HIDE_EXPANDED_VIEW:
        return true;
    default:
        return state;
    }
};

const switchCallModal = (state = {show: false, targetID: ''}, action: {type: string; data?: {targetID: string}}) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return {show: false, targetID: ''};
    case ActionTypes.SHOW_SWITCH_CALL_MODAL:
        return {show: true, targetID: action.data?.targetID};
    case ActionTypes.HIDE_SWITCH_CALL_MODAL:
        return {show: false, targetID: ''};
    default:
        return state;
    }
};

const screenSourceModal = (state = false, action: {type: string}) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return false;
    case ActionTypes.SHOW_SCREEN_SOURCE_MODAL:
        return true;
    case ActionTypes.HIDE_SCREEN_SOURCE_MODAL:
        return false;
    default:
        return state;
    }
};

export default combineReducers({
    isVoiceEnabled,
    voiceConnectedChannels,
    connectedChannelID,
    connectedCallID,
    connectedCallUrl,
    voiceConnectedProfiles,
    voiceUsersStatuses,
    callStartAt,
    voiceChannelScreenSharingID,
    expandedView,
    switchCallModal,
    screenSourceModal,
    callParameters,
});
