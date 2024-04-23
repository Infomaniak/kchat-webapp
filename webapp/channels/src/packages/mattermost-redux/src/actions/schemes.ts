// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Scheme, SchemeScope, SchemePatch} from '@mattermost/types/schemes';

import {SchemeTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import type {ActionFuncAsync} from 'mattermost-redux/types/actions';

import {logError} from './errors';
import {bindClientFunc, forceLogoutIfNecessary} from './helpers';

import {General} from '../constants';

export function getScheme(schemeId: string) {
    return bindClientFunc({
        clientFunc: Client4.getScheme,
        onSuccess: [SchemeTypes.RECEIVED_SCHEME],
        params: [
            schemeId,
        ],
    });
}

export function getSchemes(scope: SchemeScope, page = 0, perPage: number = General.PAGE_SIZE_DEFAULT) {
    return bindClientFunc({
        clientFunc: Client4.getSchemes,
        onSuccess: [SchemeTypes.RECEIVED_SCHEMES],
        params: [
            scope,
            page,
            perPage,
        ],
    });
}

export function createScheme(scheme: Scheme) {
    return bindClientFunc({
        clientFunc: Client4.createScheme,
        onSuccess: [SchemeTypes.CREATED_SCHEME],
        params: [
            scheme,
        ],
    });
}

export function deleteScheme(schemeId: string): ActionFuncAsync {
    return async (dispatch, getState) => {
        let data = null;
        try {
            data = await Client4.deleteScheme(schemeId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch({type: SchemeTypes.DELETED_SCHEME, data: {schemeId}});

        return {data};
    };
}

export function patchScheme(schemeId: string, scheme: SchemePatch) {
    return bindClientFunc({
        clientFunc: Client4.patchScheme,
        onSuccess: [SchemeTypes.PATCHED_SCHEME],
        params: [
            schemeId,
            scheme,
        ],
    });
}

export function getSchemeTeams(schemeId: string, page = 0, perPage: number = General.PAGE_SIZE_DEFAULT) {
    return bindClientFunc({
        clientFunc: Client4.getSchemeTeams,
        onSuccess: [SchemeTypes.RECEIVED_SCHEME_TEAMS],
        params: [
            schemeId,
            page,
            perPage,
        ],
    });
}

export function getSchemeChannels(schemeId: string, page = 0, perPage: number = General.PAGE_SIZE_DEFAULT) {
    return bindClientFunc({
        clientFunc: Client4.getSchemeChannels,
        onSuccess: [SchemeTypes.RECEIVED_SCHEME_CHANNELS],
        params: [
            schemeId,
            page,
            perPage,
        ],
    });
}
