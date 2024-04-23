// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {AnyAction} from 'redux';
import {combineReducers} from 'redux';

import type {PreferenceType} from '@mattermost/types/preferences';

import {PreferenceTypes, UserTypes} from 'mattermost-redux/action_types';

function getKey(preference: PreferenceType) {
    return `${preference.category}--${preference.name}`;
}

function setAllPreferences(preferences: PreferenceType[]): any {
    const nextState: any = {};

    if (preferences) {
        for (const preference of preferences) {
            nextState[getKey(preference)] = preference;
        }
    }

    return nextState;
}

function myPreferences(state: Record<string, PreferenceType> = {}, action: AnyAction) {
    switch (action.type) {
    case PreferenceTypes.RECEIVED_ALL_PREFERENCES:
        return setAllPreferences(action.data);

    case UserTypes.LOGIN: // Used by the mobile app
        return setAllPreferences(action.data.preferences);

    case PreferenceTypes.RECEIVED_PREFERENCES: {
        const nextState = {...state};

        if (action.data) {
            for (const preference of action.data) {
                nextState[getKey(preference)] = preference;
            }
        }

        return nextState;
    }
    case PreferenceTypes.DELETED_PREFERENCES: {
        const nextState = {...state};

        if (action.data) {
            for (const preference of action.data) {
                Reflect.deleteProperty(nextState, getKey(preference));
            }
        }

        return nextState;
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({

    // object where the key is the category-name and has the corresponding value
    myPreferences,
});
