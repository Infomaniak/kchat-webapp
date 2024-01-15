// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {UserTypes} from 'mattermost-redux/action_types';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {KdriveActionTypes} from 'utils/constants';

function kdrive(state = null, action: GenericAction) {
    switch (action.type) {
    // case KdriveActionTypes.STORE_BRIDGE:
    //     return action.bridge;
    case UserTypes.LOGOUT_SUCCESS:
        return null;
    default:
        return state;
    }
}
export default combineReducers({
    kdrive,
});
