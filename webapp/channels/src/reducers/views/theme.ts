// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import type {GenericAction} from 'mattermost-redux/types/actions';

import {ThemeTypes} from 'utils/constants';

import type {ViewsState} from 'types/store/views';

function storedTheme(state: ViewsState['theme']['storedTheme'] = null, action: GenericAction) {
    switch (action.type) {
    case ThemeTypes.RECEIVED_THEME:
        return action.data.theme;
    default:
        return state;
    }
}

export default combineReducers({
    storedTheme,
});
