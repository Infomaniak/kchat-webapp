// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Timezone} from 'timezones.json';
import timezones from 'timezones.json';

import type {GlobalState} from '@mattermost/types/store';
import type {UserProfile, UserTimezone} from '@mattermost/types/users';

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';
import {getUserCurrentTimezone, getTimezoneLabel as getTimezoneLabelUtil} from 'mattermost-redux/utils/timezone_utils';

export function getTimezoneForUserProfile(profile: UserProfile) {
    if (profile && profile.timezone) {
        return {
            ...profile.timezone,
            useAutomaticTimezone: profile.timezone.useAutomaticTimezone === 'true',
        };
    }

    return {
        useAutomaticTimezone: true,
        automaticTimezone: '',
        manualTimezone: '',
    };
}

export function isTimezoneEnabled(state: GlobalState) {
    const {config} = state.entities.general;
    return config.ExperimentalTimezone === 'true';
}

export const makeGetUserTimezone = () => createSelector(
    'makeGetUserTimezone',
    (state: GlobalState, userId: string) => getUser(state, userId),
    (user: UserProfile) => {
        return getTimezoneForUserProfile(user);
    },
);

export const getTimezoneLabel: (state: GlobalState, userId: UserProfile['id']) => string = createSelector(
    'getTimezoneLabel',
    () => timezones,
    makeGetUserTimezone(),
    (timezones: Timezone[], timezoneObject: UserTimezone) => {
        const timezone = getUserCurrentTimezone(timezoneObject);
        if (!timezone) {
            return '';
        }
        return getTimezoneLabelUtil(timezones, timezone);
    },
);

export const getCurrentTimezoneFull = createSelector(
    'getCurrentTimezoneFull',
    getCurrentUser,
    (currentUser) => {
        return getTimezoneForUserProfile(currentUser);
    },
);

export const getCurrentTimezone = createSelector(
    'getCurrentTimezone',
    getCurrentTimezoneFull,
    (timezoneFull) => {
        return getUserCurrentTimezone(timezoneFull);
    },
);
