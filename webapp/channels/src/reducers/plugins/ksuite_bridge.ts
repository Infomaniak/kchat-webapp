
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {UserTypes} from 'mattermost-redux/action_types';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {BridgeActionTypes} from 'utils/constants';

function bridge(state = null, action: GenericAction) {
    switch (action.type) {
    case BridgeActionTypes.STORE_BRIDGE:
        return action.bridge;
    case UserTypes.LOGOUT_SUCCESS:
        return null;
    default:
        return state;
    }
}

export default combineReducers({
    bridge,
});
