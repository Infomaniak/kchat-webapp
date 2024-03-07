// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PQueue from 'p-queue';
import {batchActions} from 'redux-batched-actions';

import type {Draft as ServerDraft} from '@mattermost/types/drafts';
import type {FileInfo} from '@mattermost/types/files';
import type {PostMetadata, PostPriorityMetadata} from '@mattermost/types/posts';
import type {PreferenceType} from '@mattermost/types/preferences';
import type {UserProfile} from '@mattermost/types/users';

import {getPost} from 'mattermost-redux/actions/posts';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Client4} from 'mattermost-redux/client';
import Preferences from 'mattermost-redux/constants/preferences';
import {syncedDraftsAreAllowedAndEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import type {ActionFunc, ActionFuncAsync} from 'mattermost-redux/types/actions';

import {removeGlobalItem, setGlobalItem} from 'actions/storage';
import {makeGetDrafts} from 'selectors/drafts';
import {getGlobalItem} from 'selectors/storage';

import {ActionTypes, StoragePrefixes} from 'utils/constants';

import type {GlobalState} from 'types/store';
import type {PostDraft} from 'types/store/draft';

type Draft = {
    key: keyof GlobalState['storage']['storage'];
    value: PostDraft;
    timestamp: Date;
}

const updateDraftQueue = new PQueue({concurrency: 1});

/**
 * Gets drafts stored on the server and reconciles them with any locally stored drafts.
 * @param teamId Only drafts for the given teamId will be fetched.
 */
export function getDrafts(teamId: string): ActionFuncAsync<boolean, GlobalState> {
    const getLocalDrafts = makeGetDrafts(false);

    return async (dispatch, getState) => {
        const state = getState();

        let serverDrafts: Draft[] = [];
        try {
            const response = await Client4.getUserDrafts(teamId);

            // check if response is an array
            if (Array.isArray(response)) {
                serverDrafts = response.map((draft) => transformServerDraft(draft));
            }
        } catch (error) {
            return {data: false, error};
        }

        const drafts = [...serverDrafts];
        const localDrafts = getLocalDrafts(state);

        // drafts that are not on server, but on local storage
        const localOnlyDrafts = localDrafts.filter((localDraft) => {
            return !serverDrafts.find((serverDraft) => serverDraft.key === localDraft.key);
        });

        // check if drafts are still valid
        await Promise.all(localOnlyDrafts.map(async (draft) => {
            if (draft.value.rootId) {
                // get post from server to check if it exists
                const {error} = await dispatch(getPost(draft.value.rootId));

                // remove locally stored draft if post does not exist
                if (error.status_code === 404) {
                    await dispatch(setGlobalItem(draft.key, {message: '', fileInfos: [], uploadsInProgress: []}));
                    await dispatch(removeGlobalItem(draft.key));
                    return;
                }
            }

            drafts.push(draft);
        }));

        // Reconcile drafts and only keep the latest version of a draft.
        const draftsMap = new Map(drafts.map((draft) => [draft.key, draft]));
        drafts.forEach((draft) => {
            const currentDraft = draftsMap.get(draft.key);
            if (currentDraft && draft.timestamp > currentDraft.timestamp) {
                draftsMap.set(draft.key, draft);
            }
        });

        const actions = Array.from(draftsMap).map(([key, draft]) => {
            return setGlobalItem(key, draft.value);
        });

        dispatch(batchActions(actions));
        return {data: true};
    };
}

export function removeDraft(key: string, channelId: string, rootId = ''): ActionFuncAsync<boolean, GlobalState> {
    return async (dispatch, getState) => {
        const state = getState();
        const draft = getGlobalItem(state, key, {});

        // set draft to empty to re-render the component
        await dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));

        // remove draft from storage
        await dispatch(removeGlobalItem(key));

        if (syncedDraftsAreAllowedAndEnabled(state)) {
            // const connectionId = getConnectionId(getState());

            try {
                console.log(`@debug_draft removing draft from api ~ key: ${key}, channelId: ${channelId}, rootId: ${rootId}`);

                if (draft.timestamp) {
                    await Client4.deleteScheduledDraft(draft.id);
                } else {
                    await Client4.deleteDraft(channelId, rootId);
                }
            } catch (error) {
                console.log('@debug_draft Could not delete draft from api', key);
                return {
                    data: false,
                    error,
                };
            }
        }
        return {data: true};
    };
}

// Assert previous call ended before dispatching the action again to ensure latest draftId is used and prevent multiple draft creation on the same channel
export const addToUpdateDraftQueue = (key: string, value: PostDraft|null, rootId = '', save = false, scheduleDelete = false): ActionFuncAsync<boolean, GlobalState> => {
    return (dispatch) => {
        return updateDraftQueue.add(() => dispatch(updateDraft(key, value, rootId, save, scheduleDelete)));
    };
};

export function updateDraft(key: string, value: PostDraft|null, rootId = '', save = false, scheduleDelete = false): ActionFuncAsync<boolean, GlobalState> {
    return async (dispatch, getState) => {
        const state = getState();
        const activeDraft = getGlobalItem(state, key, {});
        let updatedValue: PostDraft|null = null;
        if (value) {
            const timestamp = new Date().getTime();
            const data = getGlobalItem(state, key, {});
            updatedValue = {
                ...value,
                id: value.id || activeDraft.id,
                createAt: data.createAt || timestamp,
                updateAt: timestamp,
            };
        }

        if (scheduleDelete) {
            const newValue = {...updatedValue};
            Reflect.deleteProperty(newValue, 'timestamp');
            console.log('@debug_draft updateDraft (scheduled)', `key: ${key}`, `id: ${newValue?.id}`, `updatedAt: ${newValue?.updateAt}`, `createdAt: ${newValue?.createAt}`);
            dispatch(setGlobalDraft(key, newValue as PostDraft, false));
        } else {
            console.log('@debug_draft updateDraft', `key: ${key}`, `id: ${updatedValue?.id}`, `updatedAt: ${updatedValue?.updateAt}`, `createdAt: ${updatedValue?.createAt}`);
            dispatch(setGlobalDraft(key, updatedValue, false));
        }

        if (syncedDraftsAreAllowedAndEnabled(state) && save && updatedValue) {
            const userId = getCurrentUserId(state);

            try {
                if (value?.message === '' || value?.message.replace(/\s/g, '').length || (value && value?.fileInfos.length > 0)) {
                    if (value?.message.replace(/\s/g, '').length) {
                        const {id} = await upsertDraft(updatedValue, userId, rootId, scheduleDelete);
                        updatedValue.id = id;
                    } else {
                        //This case is when there is a file attached with no message
                        await upsertDraft({...updatedValue, message: ''}, userId, rootId, scheduleDelete);
                    }
                }
            } catch (error) {
                return {data: false, error};
            }
        }

        return {data: true};
    };
}

export function upsertScheduleDraft(key: string, value: PostDraft, rootId = ''): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;
        if (!syncedDraftsAreAllowedAndEnabled(state)) {
            return {error: new Error('Drafts are not allowed on the current server')};
        }
        const userId = getCurrentUserId(state);

        const activeDraft = getGlobalItem(state, key, null);
        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));

        try {
            console.log('@debug_draft upsertScheduleDraft', `id: ${value?.id}`, `updatedAt: ${value?.updateAt}`, `createdAt: ${value?.createAt}`);
            const {id} = await upsertDraft(value, userId, rootId);
            dispatch(setGlobalItem(`${key}_${id}`, {
                ...value,
                id,
            }));
        } catch (error) {
            console.log('@debug_draft upsertScheduleDraft Error', `id: ${value?.id}`, `updatedAt: ${value?.updateAt}`, `createdAt: ${value?.createAt}`);
            if (activeDraft) {
                dispatch(setGlobalItem(key, activeDraft));
            }
            return {error};
        }
        return {data: true};
    };
}

function upsertDraft(draft: PostDraft, userId: UserProfile['id'], rootId = '', scheduleDelete = false) {
    const fileIds = draft.fileInfos.map((file) => file.id);
    const newDraft = {
        id: draft.id,
        create_at: draft.createAt || 0,
        update_at: draft.updateAt || 0,
        delete_at: 0,
        user_id: userId,
        channel_id: draft.channelId,
        root_id: draft.rootId || rootId,
        message: draft.message,
        props: draft.props,
        file_ids: fileIds,
        timestamp: draft.timestamp,
        priority: draft.metadata?.priority as PostPriorityMetadata,
    };

    if (draft.timestamp && draft.id) {
        if (scheduleDelete) {
            Reflect.deleteProperty(newDraft, 'timestamp');
        }

        console.log('@debug_draft upsertDraft (scheduleDrat)', `id: ${newDraft?.id}`, `updatedAt: ${draft?.updateAt}`, `createdAt: ${draft?.createAt}`);
        return Client4.updateScheduledDraft(newDraft);
    }

    console.log('@debug_draft upsertDraft', `id: ${newDraft?.id}`, `updatedAt: ${draft?.updateAt}`, `createdAt: ${draft?.createAt}`);

    return Client4.upsertDraft(newDraft);
}

export function setDraftsTourTipPreference(initializationState: Record<string, boolean>): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const preference: PreferenceType = {
            user_id: currentUserId,
            category: Preferences.CATEGORY_DRAFTS,
            name: Preferences.DRAFTS_TOUR_TIP_SHOWED,
            value: JSON.stringify(initializationState),
        };
        await dispatch(savePreferences(currentUserId, [preference]));
        return {data: true};
    };
}

export function setGlobalDraft(key: string, value: PostDraft|null, isRemote: boolean): ActionFunc {
    return (dispatch) => {
        dispatch(setGlobalItem(key, value));
        dispatch(setGlobalDraftSource(key, isRemote));
        return {data: true};
    };
}

export function setGlobalDraftSource(key: string, isRemote: boolean) {
    return {
        type: ActionTypes.SET_DRAFT_SOURCE,
        data: {
            key,
            isRemote,
        },
    };
}

export function transformServerDraft(draft: ServerDraft): Draft {
    let key: Draft['key'] = `${StoragePrefixes.DRAFT}${draft.channel_id}`;

    if (draft.root_id !== '') {
        key = `${StoragePrefixes.COMMENT_DRAFT}${draft.root_id}`;
    }

    if (draft.timestamp) {
        key += `_${draft.id}`;
    }

    let fileInfos: FileInfo[] = [];
    if (draft.metadata?.files) {
        fileInfos = draft.metadata.files;
    }

    const metadata = (draft.metadata || {}) as PostMetadata;
    if (draft.priority) {
        metadata.priority = draft.priority;
    }

    return {
        key,
        timestamp: new Date(draft.update_at),
        value: {
            id: draft.id,
            message: draft.message,
            timestamp: draft.timestamp,
            fileInfos,
            props: draft.props,
            uploadsInProgress: [],
            channelId: draft.channel_id,
            rootId: draft.root_id,
            createAt: draft.create_at,
            updateAt: draft.update_at,
            metadata,
            show: true,
        },
    };
}
