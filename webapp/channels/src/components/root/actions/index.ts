// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {History} from 'history';

import type {ServerError} from '@mattermost/types/errors';
import type {UserProfile} from '@mattermost/types/users';

import {logError} from 'mattermost-redux/actions/errors';
import {getClientConfig, getFirstAdminSetupComplete, getLicenseConfig} from 'mattermost-redux/actions/general';
import {redirectToErrorPageIfNecessary} from 'mattermost-redux/actions/helpers';
import {getProfiles, loadMe} from 'mattermost-redux/actions/users';
import {General} from 'mattermost-redux/constants';
import {getIsOnboardingFlowEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getActiveTeamsList} from 'mattermost-redux/selectors/entities/teams';
import {checkIsFirstAdmin, getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {emitUserLoggedOutEvent, redirectUserToDefaultTeam} from 'actions/global_actions';

import {checkIKTokenIsExpired, refreshIKToken} from 'components/login/utils';

import {ActionTypes, StoragePrefixes} from 'utils/constants';
import {isDesktopApp, isMacApp, isNotMacMas} from 'utils/user_agent';

import type {ActionFuncAsync, ThunkActionFunc} from 'types/store';
import type {Translations} from 'types/store/i18n';

export type TranslationPluginFunction = (locale: string) => Translations

/**
 * This function meant to be used in root.tsx component loads config, license and if user is logged in, it loads user and its related data.
 */
export function loadConfigAndMe(): ThunkActionFunc<Promise<{isLoaded: boolean; isMeRequested?: boolean}>> {
    return async (dispatch) => {
        // If expired, refresh token
        if (isDesktopApp() && checkIKTokenIsExpired()) {
            console.log('[actions/view/root] desktop token is expired'); // eslint-disable-line no-console
            await refreshIKToken(/*redirectToReam*/false)?.catch((e: unknown) => {
                console.warn('[actions/view/root] desktop token refresh error: ', e); // eslint-disable-line no-console
            });
        }

        // attempt to load config and license regardless if user is logged in or not
        try {
            await Promise.all([
                dispatch(getClientConfig()),
                dispatch(getLicenseConfig()),
            ]);

            let redirect = true;
            if (!isMacApp() || !isNotMacMas()) {
                redirect = false;
            }

            if (redirect) {
                const forceMigrationError: ServerError = {
                    message: 'Maintenance mode',
                    status_code: 1,
                };
                redirectToErrorPageIfNecessary(forceMigrationError);
            }
        } catch (error) {
            console.debug('Error loading config and license', error); //eslint-disable-line no-console
            dispatch(logError(error as ServerError));
            return {
                isMeRequested: false,
                isLoaded: false,
            };
        }

        const dataFromLoadMe = await dispatch(loadMe());

        return {
            isLoaded: dataFromLoadMe.data || false,
            isMeRequested: true,
        };
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

export function redirectToOnboardingOrDefaultTeam(history: History, searchParams?: URLSearchParams): ThunkActionFunc<void> {
    return async (dispatch, getState) => {
        const state = getState();
        const isUserAdmin = isCurrentUserSystemAdmin(state);
        if (!isUserAdmin) {
            redirectUserToDefaultTeam(searchParams);
            return;
        }

        const teams = getActiveTeamsList(state);

        const onboardingFlowEnabled = getIsOnboardingFlowEnabled(state);

        if (teams.length > 0 || !onboardingFlowEnabled) {
            redirectUserToDefaultTeam(searchParams);
            return;
        }

        const firstAdminSetupComplete = await dispatch(getFirstAdminSetupComplete());
        if (firstAdminSetupComplete?.data) {
            redirectUserToDefaultTeam(searchParams);
            return;
        }

        const profilesResult = await dispatch(getProfiles(0, General.PROFILE_CHUNK_SIZE, {roles: General.SYSTEM_ADMIN_ROLE}));
        if (profilesResult.error) {
            redirectUserToDefaultTeam(searchParams);
            return;
        }
        const currentUser = getCurrentUser(getState());
        const adminProfiles = profilesResult.data?.reduce(
            (acc: Record<string, UserProfile>, curr: UserProfile) => {
                acc[curr.id] = curr;
                return acc;
            },
            {},
        );
        if (adminProfiles && checkIsFirstAdmin(currentUser, adminProfiles)) {
            history.push('/preparing-workspace');
            return;
        }

        redirectUserToDefaultTeam(searchParams);
    };
}

export function handleLoginLogoutSignal(e: StorageEvent): ThunkActionFunc<void> {
    return (dispatch, getState) => {
        // when one tab on a browser logs out, it sets __logout__ in localStorage to trigger other tabs to log out
        const isNewLocalStorageEvent = (event: StorageEvent) => event.storageArea === localStorage && event.newValue;

        if (e.key === StoragePrefixes.LOGOUT && isNewLocalStorageEvent(e)) {
            console.log('detected logout from a different tab'); //eslint-disable-line no-console
            emitUserLoggedOutEvent('/', false, false);
        }
        if (e.key === StoragePrefixes.LOGIN && isNewLocalStorageEvent(e)) {
            const isLoggedIn = getCurrentUser(getState());

            // make sure this is not the same tab which sent login signal
            // because another tabs will also send login signal after reloading
            if (isLoggedIn) {
                return;
            }

            // detected login from a different tab
            function reloadOnFocus() {
                location.reload();
            }
            window.addEventListener('focus', reloadOnFocus);
        }
    };
}
