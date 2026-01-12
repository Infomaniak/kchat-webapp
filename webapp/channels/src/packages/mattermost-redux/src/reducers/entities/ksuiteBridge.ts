
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {AnyAction} from 'redux';
import {combineReducers} from 'redux';

import {BridgeActionTypes, UserTypes} from 'mattermost-redux/action_types';

function bridge(state = null, action: AnyAction) {
    switch (action.type) {
    case BridgeActionTypes.STORE_BRIDGE:
        return action.bridge;
    case UserTypes.LOGOUT_SUCCESS:
        return null;
    default:
        return state;
    }
}

function dnd(state = false, action: AnyAction) {
    switch (action.type) {
    case BridgeActionTypes.DND_CHANGE:
        return action.dnd;
    default:
        return state;
    }
}

function ksuiteMode(state = null, action: AnyAction) {
    switch (action.type) {
    case BridgeActionTypes.UPDATE_PARAMS_DATA:
        if (action.ksuiteMode) {
            return action.ksuiteMode;
        }
        return state;
    default:
        return state;
    }
}

function spaceId(state = null, action: AnyAction) {
    switch (action.type) {
    case BridgeActionTypes.UPDATE_PARAMS_DATA:
        if (action.spaceId) {
            return action.spaceId;
        }
        return state;
    default:
        return state;
    }
}

export default combineReducers({
    bridge,
    dnd,
    ksuiteMode,
    spaceId,
});
