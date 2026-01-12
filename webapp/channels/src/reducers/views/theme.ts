// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import type {AnyAction} from 'redux';

import {ThemeTypes} from 'utils/constants';

import type {ViewsState} from 'types/store/views';

function storedTheme(state: ViewsState['theme']['storedTheme'] = null, action: AnyAction) {
    switch (action.type) {
    case ThemeTypes.RECEIVED_THEME:
        return action.data.theme;
    default:
        return state;
    }
}

function themePreference(state: ViewsState['theme']['themePreference'] = null, action: AnyAction) {
    switch (action.type) {
    case ThemeTypes.RECEIVED_THEME_PREFERENCE:
        return action.data.theme;
    default:
        return state;
    }
}

export default combineReducers({
    storedTheme,
    themePreference,
});
