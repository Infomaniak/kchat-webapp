// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {History} from 'history';

import type {ServerError} from '@mattermost/types/errors';
import type {UserProfile} from '@mattermost/types/users';

import {GeneralTypes} from 'mattermost-redux/action_types';
import {logError} from 'mattermost-redux/actions/errors';
import {getClientConfig, getLicenseConfig, getFirstAdminSetupComplete} from 'mattermost-redux/actions/general';
import {redirectToErrorPageIfNecessary} from 'mattermost-redux/actions/helpers';
import {getMyPreferences} from 'mattermost-redux/actions/preferences';
import {getMyKSuites, getMyTeamMembers, getMyTeamUnreads} from 'mattermost-redux/actions/teams';
import {getMe, getProfiles} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {General} from 'mattermost-redux/constants';
import {isCollapsedThreadsEnabled, getIsOnboardingFlowEnabled, getTeamsOrderPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getActiveTeamsList, getTeams} from 'mattermost-redux/selectors/entities/teams';
import {checkIsFirstAdmin, getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getLastKSuiteSeenId} from 'mattermost-redux/utils/team_utils';

import {getMyMeets} from 'actions/calls';
import {redirectUserToDefaultTeam, emitUserLoggedOutEvent} from 'actions/global_actions';
import {updateTeamsOrderForUser} from 'actions/team_actions';

import {getHistory} from 'utils/browser_history';
import {ActionTypes, StoragePrefixes} from 'utils/constants';
import {isDesktopApp, isMacApp, isNotMacMas} from 'utils/user_agent';

import type {ActionFuncAsync, ThunkActionFunc} from 'types/store';
import type {Translations} from 'types/store/i18n';

export type TranslationPluginFunction = (locale: string) => Translations

/**
 * This function meant to be used in root.tsx component loads config, license and if user is logged in, it loads user and its related data.
 */
export function loadConfigAndMe(): ThunkActionFunc<Promise<{isLoaded: boolean; isMeRequested?: boolean}>> {
    return async (dispatch, getState) => {
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
            dispatch(logError(error as ServerError));
            return {
                isLoaded: false,
            };
        }

        // Load user and its related data now that we know that user is logged in
        const serverVersion = getState().entities.general.serverVersion || Client4.getServerVersion();
        dispatch({type: GeneralTypes.RECEIVED_SERVER_VERSION, data: serverVersion});
        const kSuiteCall = await dispatch(getMyKSuites());
        const kSuites = getTeams(getState());

        const suiteArr = Object.values(kSuites);

        if (suiteArr.length > 0) {
            const lastKSuiteSeenId = getLastKSuiteSeenId();
            const sortedSuites = suiteArr.sort((a, b) => {
                if (a.id === lastKSuiteSeenId) {
                    return -1;
                }
                if (b.id === lastKSuiteSeenId) {
                    return 1;
                }
                return b.update_at - a.update_at;
            });
            const lastKSuiteSeen = sortedSuites[0];

            if (isDesktopApp()) {
                window.postMessage({
                    type: 'switch-server',
                    data: lastKSuiteSeen.display_name,
                }, window.origin);
            }

            try {
                await Promise.all([
                    dispatch(getMe()),
                    dispatch(getMyPreferences()),
                    dispatch(getMyTeamMembers()),
                    dispatch(getMyMeets()),
                ]);
                dispatch(getMyTeamUnreads(isCollapsedThreadsEnabled(getState())));

                if (kSuiteCall?.data && Array.isArray(kSuiteCall.data)) {
                    // IK change: The desktop logic for team order is based on the 'teams_order' preference.
                    // Therefore, we need to update the preference while respecting the order already established by the desktop.
                    // If there is a new team, we add it to the end of the array.
                    // If one of the teams in the preference has been deleted, we remove it.

                    const fetchedTeamIds = kSuiteCall.data.map((team) => team.id);
                    const state = getState();

                    // IK change: getTeamsOrderPreference returns an object, not an array
                    // We need to convert the CSV string in prefObj.value into a proper array
                    const prefObj = getTeamsOrderPreference(state);
                    const currentPreferences: string[] = prefObj?.value ? prefObj.value.split(',') : [];

                    // Filter out any preferences that no longer exist in fetchedTeamIds
                    const cleanedPreferences = currentPreferences.filter((id) => fetchedTeamIds.includes(id));

                    // Find any new teams that aren't already in the preferences
                    const missingTeamIds = fetchedTeamIds.filter((id) => !cleanedPreferences.includes(id));

                    // Combine the cleaned preferences with the missing teams appended at the end
                    const updatedPreferences = [...cleanedPreferences, ...missingTeamIds];

                    // Ensure uniqueness just in case
                    const uniquePreferences = [...new Set(updatedPreferences)];

                    // Check if the preferences actually changed
                    const hasChanged =
        uniquePreferences.length !== currentPreferences.length ||
        uniquePreferences.some((id, index) => id !== currentPreferences[index]);

                    // If there was a change, update the user's team order preferences
                    if (hasChanged) {
                        // eslint-disable-next-line no-console
                        console.log('[loadConfigAndMe] Syncing team order preferences after fetch:', uniquePreferences);
                        updateTeamsOrderForUser(uniquePreferences);
                    }
                }
            } catch (error) {
                dispatch(logError(error as ServerError));
                return {
                    isLoaded: false,
                };
            }
        } else if (!isDesktopApp()) {
            // we should not use getHistory in mattermost-redux since it is an import from outside the package, but what else can we do
            if (kSuiteCall && kSuiteCall.data) {
                getHistory().push('/error?type=no_ksuite');
            }
        }

        return {
            isLoaded: true,
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
