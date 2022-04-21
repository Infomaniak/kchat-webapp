// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {UserTypes} from 'mattermost-redux/action_types';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {ActionTypes, StorageTypes} from 'utils/constants';

function useInfomaniakTokens(state = {}, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SET_INFOMANIAK_TOKEN:
        return {
            accessToken: action.x.accessToken,
            refreshToken: action.x.refreshToken,
        };

    case StorageTypes.STORAGE_REHYDRATE: {
        return {...state, ...action.x};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {
            accessToken: null,
            refreshToken: null,
        };
    default:
        return state;
    }
}

export default combineReducers({
    useInfomaniakTokens,
});
