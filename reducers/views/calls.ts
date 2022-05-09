// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {UserProfile} from 'mattermost-redux/types/users';
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

interface ConnectedProfilesState {
    [channelID: string]: UserProfile[];
}

interface ConnectedProfilesAction {
    type: string;
    data: {
        channelID: string;
        userID?: string;
        profile?: UserProfile;
        profiles?: UserProfile[];
    };
}

const voiceConnectedProfiles = (state: ConnectedProfilesState = {}, action: ConnectedProfilesAction) => {
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

interface ConnectedChannelsState {
    [channelID: string]: string[];
}

interface ConnectedChannelsAction {
    type: string;
    data: {
        channelID: string;
        userID?: string;
        users?: string[];
    };
}

const voiceConnectedChannels = (state: ConnectedChannelsState = {}, action: ConnectedChannelsAction) => {
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
    case ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED: {
        const chan = state[action.data.channelID];

        if (chan) {
            let callChan = chan[action.data.callID]
            if (callChan) {
                callChan = callChan.filter((val) => val !== action.data.userID);

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
                [action.data.id]: [action.data.users],
            },
        };
    case ActionTypes.VOICE_CHANNEL_ADDED:
        return {
            ...state,
            [action.data.channelID]: {
                [action.data.id]: [action.data.participants],
            },
        };
    case ActionTypes.VOICE_CHANNEL_DELETED: {
        const newState = {...state};
        const chan = state[action.data.channelID];

        if (chan) {
            let callChan = chan[action.data.callID];
            if (callChan) {
                delete newState[action.data.channelID][action.data.callID];

                return newState;
            }
        }
        return state;
    }
    default:
        return state;
    }
};

const connectedChannelID = (state: string | null = null, action: {type: string; data: {channelID: string; currentUserID: string; userID: string}}) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
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

const connectedCallID = (state: string | null = null, action: {type: string; data: {channelID: string; currentUserID: string; userID: string}}) => {
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

interface UsersStatusesState {
    [channelID: string]: {
        [userID: string]: UserState;
    };
}

interface UsersStatusesAction {
    type: string;
    data: {
        channelID: string;
        userID: string;
        raised_hand?: number;
        states: {[userID: string]: UserState};
    };
}

const voiceUsersStatuses = (state: UsersStatusesState = {}, action: UsersStatusesAction) => {
    switch (action.type) {
    case ActionTypes.VOICE_CHANNEL_UNINIT:
        return {};
    case ActionTypes.VOICE_CHANNEL_USER_CONNECTED:
        if (state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: {
                    ...state[action.data.channelID],
                    [action.data.userID]: {
                        unmuted: false,
                        voice: false,
                        raised_hand: 0,
                    },
                },
            };
        }
        return state;
    case ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED:
        if (state[action.data.channelID]) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {[action.data.userID]: omit, ...res} = state[action.data.channelID];
            return {
                ...state,
                [action.data.channelID]: res,
            };
        }
        return state;
    case ActionTypes.VOICE_CHANNEL_USERS_CONNECTED_STATES:
        return {
            ...state,
            [action.data.channelID]: action.data.states,
        };
    case ActionTypes.VOICE_CHANNEL_USER_MUTED:
        if (!state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: {
                    [action.data.userID]: {
                        unmuted: false,
                        voice: false,
                        raised_hand: 0,
                    },
                },
            };
        }
        return {
            ...state,
            [action.data.channelID]: {
                ...state[action.data.channelID],
                [action.data.userID]: {
                    ...state[action.data.channelID][action.data.userID],
                    unmuted: false,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_UNMUTED:
        if (!state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: {
                    [action.data.userID]: {
                        unmuted: true,
                        voice: false,
                        raised_hand: 0,
                    },
                },
            };
        }
        return {
            ...state,
            [action.data.channelID]: {
                ...state[action.data.channelID],
                [action.data.userID]: {
                    ...state[action.data.channelID][action.data.userID],
                    unmuted: true,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_VOICE_ON:
        if (!state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: {
                    [action.data.userID]: {
                        unmuted: false,
                        voice: true,
                        raised_hand: 0,
                    },
                },
            };
        }
        return {
            ...state,
            [action.data.channelID]: {
                ...state[action.data.channelID],
                [action.data.userID]: {
                    ...state[action.data.channelID][action.data.userID],
                    voice: true,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_VOICE_OFF:
        if (!state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: {
                    [action.data.userID]: {
                        unmuted: false,
                        voice: false,
                        raised_hand: 0,
                    },
                },
            };
        }
        return {
            ...state,
            [action.data.channelID]: {
                ...state[action.data.channelID],
                [action.data.userID]: {
                    ...state[action.data.channelID][action.data.userID],
                    voice: false,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_RAISE_HAND:
        if (!state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: {
                    [action.data.userID]: {
                        unmuted: false,
                        voice: false,
                        raised_hand: action.data.raised_hand,
                    },
                },
            };
        }
        return {
            ...state,
            [action.data.channelID]: {
                ...state[action.data.channelID],
                [action.data.userID]: {
                    ...state[action.data.channelID][action.data.userID],
                    raised_hand: action.data.raised_hand,
                },
            },
        };
    case ActionTypes.VOICE_CHANNEL_USER_UNRAISE_HAND:
        if (!state[action.data.channelID]) {
            return {
                ...state,
                [action.data.channelID]: {
                    [action.data.userID]: {
                        voice: false,
                        unmuted: false,
                        raised_hand: action.data.raised_hand,
                    },
                },
            };
        }
        return {
            ...state,
            [action.data.channelID]: {
                ...state[action.data.channelID],
                [action.data.userID]: {
                    ...state[action.data.channelID][action.data.userID],
                    raised_hand: action.data.raised_hand,
                },
            },
        };
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
    voiceConnectedProfiles,
    voiceUsersStatuses,
    callStartAt,
    voiceChannelScreenSharingID,
    expandedView,
    switchCallModal,
    screenSourceModal,
});
