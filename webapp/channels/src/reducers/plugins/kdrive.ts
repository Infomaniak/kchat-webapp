// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import type {AnyAction} from 'redux';

import {UserTypes} from 'mattermost-redux/action_types';

import {KDriveActionTypes} from 'utils/constants';

function toast(state = null, action: AnyAction) {
    switch (action.type) {
    case KDriveActionTypes.TOAST:
        return action.toast;
    case UserTypes.LOGOUT_SUCCESS:
        return null;
    default:
        return state;
    }
}
export default combineReducers({
    toast,
});
