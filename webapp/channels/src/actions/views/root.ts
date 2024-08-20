// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {get} from 'lodash';

import type {ServerError} from '@mattermost/types/errors';

import {getClientConfig, getLicenseConfig} from 'mattermost-redux/actions/general';
import {redirectToErrorPageIfNecessary} from 'mattermost-redux/actions/helpers';
import {loadMe} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import type {ActionFuncAsync, ThunkActionFunc} from 'mattermost-redux/types/actions';

import {getCurrentLocale, getTranslations} from 'selectors/i18n';

import {checkIKTokenIsExpired, refreshIKToken} from 'components/login/utils';

import {ActionTypes} from 'utils/constants';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {isDesktopApp} from 'utils/user_agent';
import * as UserAgent from 'utils/user_agent';

import en from 'i18n/en.json';

import type {GlobalState} from 'types/store';
import type {Translations} from 'types/store/i18n';

const pluginTranslationSources: Record<string, TranslationPluginFunction> = {};

(window as any).HIDE_MODULE_SUPPORT = true;

export type TranslationPluginFunction = (locale: string) => Translations

export function loadConfigAndMe(): ActionFuncAsync<boolean> {
    return async (dispatch, getState) => {
        // If expired, refresh token
        const state = getState();
        const latestVer = state.entities.general.config || '';
        const userAgentVersion = UserAgent.getDesktopVersion();

        if (!UserAgent.isMacApp() || UserAgent.isNotMacMas() || !latestVer || !userAgentVersion || isServerVersionGreaterThanOrEqualTo(userAgentVersion, latestVer)) {
            const forceMigrationError: ServerError = {
                message: 'Maintenance mode',
                status_code: 1,
            };
            redirectToErrorPageIfNecessary(forceMigrationError);
        }

        if (isDesktopApp() && checkIKTokenIsExpired()) {
            console.log('[actions/view/root] desktop token is expired'); // eslint-disable-line no-console
            await refreshIKToken(/*redirectToReam*/false)?.catch((e: unknown) => {
                console.warn('[actions/view/root] desktop token refresh error: ', e); // eslint-disable-line no-console
            });
        }

        await Promise.all([
            dispatch(getClientConfig()),
            dispatch(getLicenseConfig()),
        ]);

        let isMeLoaded = false;

        // if (document.cookie.includes('MMUSERID=')) {
        const dataFromLoadMe = await dispatch(loadMe());
        isMeLoaded = dataFromLoadMe?.data ?? false;

        // }

        return {data: isMeLoaded};
    };
}

export function registerPluginTranslationsSource(pluginId: string, sourceFunction: TranslationPluginFunction): ThunkActionFunc<void, GlobalState> {
    pluginTranslationSources[pluginId] = sourceFunction;
    return (dispatch, getState) => {
        const state = getState();
        const locale = getCurrentLocale(state);
        const immutableTranslations = getTranslations(state, locale);
        const translations = {};
        Object.assign(translations, immutableTranslations);
        if (immutableTranslations) {
            Object.assign(translations, sourceFunction(locale));
            dispatch({
                type: ActionTypes.RECEIVED_TRANSLATIONS,
                data: {
                    locale,
                    translations,
                },
            });
        }
    };
}

export function unregisterPluginTranslationsSource(pluginId: string) {
    Reflect.deleteProperty(pluginTranslationSources, pluginId);
}

export function loadTranslations(locale: string, url: string): ActionFuncAsync {
    return async (dispatch) => {
        const translations = {...en};
        Object.values(pluginTranslationSources).forEach((pluginFunc) => {
            Object.assign(translations, pluginFunc(locale));
        });

        // Need to go to the server for languages other than English
        if (locale !== 'en') {
            try {
                const serverTranslations = await Client4.getTranslations(url);
                Object.assign(translations, serverTranslations);
            } catch (error) {
                console.error(error); //eslint-disable-line no-console
            }
        }
        dispatch({
            type: ActionTypes.RECEIVED_TRANSLATIONS,
            data: {
                locale,
                translations,
            },
        });
        return {data: true};
    };
}

export function registerCustomPostRenderer(type: string, component: any, id: string): ActionFuncAsync {
    return async (dispatch) => {
        // piggyback on plugins state to register a custom post renderer
        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_POST_COMPONENT,
            data: {
                postTypeId: id,
                pluginId: id,
                type,
                component,
            },
        });
        return {data: true};
    };
}

