/* eslint-disable no-console */
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import type {Draft as ServerDraft} from '@mattermost/types/drafts';
import type {FileInfo} from '@mattermost/types/files';
import type {PostMetadata, PostPriorityMetadata} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {Client4} from 'mattermost-redux/client';
import {syncedDraftsAreAllowedAndEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {removeGlobalItem, setGlobalItem} from 'actions/storage';
import {makeGetDrafts} from 'selectors/drafts';
import {getGlobalItem} from 'selectors/storage';

import {ActionTypes, StoragePrefixes} from 'utils/constants';

import type {ActionFunc, ActionFuncAsync, GlobalState, ThunkActionFunc} from 'types/store';
import type {PostDraft} from 'types/store/draft';

type Draft = {
    key: keyof GlobalState['storage']['storage'];
    value: PostDraft;
    timestamp: Date;
}

/**
 * Gets drafts stored on the server and reconciles them with any locally stored drafts.
 * @param teamId Only drafts for the given teamId will be fetched.
 */
export function getDrafts(teamId: string): ActionFuncAsync<boolean> {
    const getLocalDrafts = makeGetDrafts(false);

    return async (dispatch, getState) => {
        const state = getState();

        let serverDrafts: Draft[] = [];
        try {
            serverDrafts = (await Client4.getUserDrafts(teamId)).map((draft) => transformServerDraft(draft));
        } catch (error) {
            return {data: false, error};
        }

        const localDrafts = getLocalDrafts(state);
        const drafts = [...serverDrafts, ...localDrafts];

        // Reconcile drafts and only keep the latest version of a draft.
        const draftsMap = new Map(drafts.map((draft) => [draft.key, draft]));
        drafts.forEach((draft) => {
            const currentDraft = draftsMap.get(draft.key);
            if (currentDraft && draft.timestamp > currentDraft.timestamp) {
                draftsMap.set(draft.key, draft);
            }
        });

        const actions = Array.from(draftsMap).map(([key, draft]) => {
            // Local drafts that are past-schedule are cleared from local storage
            if (typeof draft.value.timestamp === 'number') {
                const isPastSchedule = Math.floor(Date.now() / 1000) > draft.value.timestamp;
                if (isPastSchedule) {
                    return removeGlobalItem(key);
                }
            }

            return setGlobalItem(key, draft.value);
        });

        dispatch(batchActions(actions));
        return {data: true};
    };
}

export function removeDraft(key: string, channelId: string, rootId = ''): ActionFuncAsync<boolean> {
    return async (dispatch, getState) => {
        const state = getState();
        const draft = getGlobalItem(state, key, {});

        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: [], metadata: {}}));

        if (syncedDraftsAreAllowedAndEnabled(state)) {
            // const connectionId = getConnectionId(getState());

            try {
                if (draft.timestamp) {
                    console.log(`[actions/drafts] removeDraft.deleteScheduledDraft key: ${key}, channelId: ${channelId}, rootId: ${rootId}`);
                    await Client4.deleteScheduledDraft(draft.id);
                } else {
                    console.log(`[actions/drafts] removeDraft.deleteDraft key: ${key}, channelId: ${channelId}, rootId: ${rootId}`);
                    await Client4.deleteDraft(channelId, rootId);
                }
            } catch (error) {
                console.log(`[actions/drafts] removeDraft.deleteDraft:error key: ${key}`,
                    `error: ${JSON.stringify(error)}`,
                );
                return {
                    data: false,
                    error,
                };
            }
        } else {
            // only remove draft from storage for local drafts
            await dispatch(removeGlobalItem(key));
        }
        return {data: true};
    };
}

export function updateDraft(key: string, value: PostDraft|null, rootId = '', save = false, scheduleDelete = false): ActionFuncAsync<boolean, GlobalState> {
    return async (dispatch, getState) => {
        const state = getState();
        const activeDraft = getGlobalItem(state, key, {});
        let updatedValue: PostDraft|null = null;
        if (value) {
            const timestamp = new Date().getTime();
            const data = getGlobalItem<Partial<PostDraft>>(state, key, {});
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
            console.log('[actions/drafts] updateDraft.setGlobalDraft (scheduled)',
                `key: ${key}`,
                `id: ${newValue?.id}`,
                `updatedAt: ${newValue?.updateAt}`,
                `createdAt: ${newValue?.createAt}`,
            );

            dispatch(setGlobalDraft(key, newValue as PostDraft, false));
        } else {
            console.log('[actions/drafts] updateDraft.setGlobalDraft',
                `key: ${key}`,
                `id: ${updatedValue?.id}`,
                `updatedAt: ${updatedValue?.updateAt}`,
                `createdAt: ${updatedValue?.createAt}`,
            );

            dispatch(setGlobalDraft(key, updatedValue, false));
        }

        if (syncedDraftsAreAllowedAndEnabled(state) && save && updatedValue) {
            const userId = getCurrentUserId(state);

            try {
                const isDraftMessageEmpty = (draft: PostDraft|null) =>
                    (draft?.message.replace(/\s/g, '').length === 0);

                /**
                 * Test if a draft is empty, either:
                 *  - the draft is null
                 *  - both the draft message and files are empty
                 */
                const isDraftEmpty = (draft: PostDraft|null) =>
                    (draft === null) ||
                    (isDraftMessageEmpty(draft) && (draft?.fileInfos.length === 0));

                const {id} = await upsertDraft(updatedValue as PostDraft, userId, rootId, scheduleDelete);

                // Do not update id in case there is a file attached with no message [???]
                if (!isDraftMessageEmpty(updatedValue)) {
                    // Only update the draft id if it has not been cleared from the reducer
                    // during the upsertDraft client call
                    const draft = getGlobalItem(getState(), key, {});
                    if (!isDraftEmpty(draft)) {
                        dispatch(setGlobalDraft(key, {...draft, id}, false));
                    }
                }
            } catch (error) {
                return {data: false, error};
            }
        }

        return {data: true};
    };
}

export function upsertScheduleDraft(key: string, value: PostDraft, rootId = ''): ThunkActionFunc<unknown> {
    return async (dispatch, getState) => {
        const state = getState() as GlobalState;
        if (!syncedDraftsAreAllowedAndEnabled(state)) {
            return {error: new Error('Drafts are not allowed on the current server')};
        }
        const userId = getCurrentUserId(state);

        const activeDraft = getGlobalItem(state, key, null);
        dispatch(setGlobalItem(key, {message: '', fileInfos: [], uploadsInProgress: []}));

        try {
            console.log('[actions/drafts] upsertScheduleDraft.upsertDraft',
                `id: ${value?.id}`,
                `updatedAt: ${value?.updateAt}`,
                `createdAt: ${value?.createAt}`,
            );

            const {id} = await upsertDraft(value, userId, rootId);
            dispatch(setGlobalItem(`${key}_${id}`, {
                ...value,
                id,
            }));
        } catch (error) {
            console.log('[actions/drafts] upsertScheduleDraft.upsertDraft:error',
                `id: ${value?.id}`,
                `updatedAt: ${value?.updateAt}`,
                `createdAt: ${value?.createAt}`,
                `error: ${JSON.stringify(error)}`,
            );
            if (activeDraft) {
                console.log('[actions/drafts] upsertScheduleDraft.upsertDraft:error setGlobalItem',
                    `id: ${value?.id}`,
                    `updatedAt: ${value?.updateAt}`,
                    `createdAt: ${value?.createAt}`,
                );

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

        console.log('[actions/drafts] upsertDraft.updateScheduledDraft',
            `id: ${newDraft?.id}`,
            `updatedAt: ${draft?.updateAt}`,
            `createdAt: ${draft?.createAt}`,
        );

        return Client4.updateScheduledDraft(newDraft);
    }

    console.log('[actions/drafts] upsertDraft.upsertDraft',
        `id: ${newDraft?.id}`,
        `updatedAt: ${draft?.updateAt}`,
        `createdAt: ${draft?.createAt}`,
    );

    return Client4.upsertDraft(newDraft);
}

export function setGlobalDraft(key: string, value: PostDraft|null, isRemote: boolean): ActionFunc {
    return (dispatch) => {
        if (value && !value.message) {
            value.message = ''; // prevent message to be null and raise an exception
        }
        if (value?.message === '' || (value?.message?.replace(/\s/g, '').length) || (value && value?.fileInfos.length > 0)) {
            if (value?.message.replace(/\s/g, '').length) {
                dispatch(setGlobalItem(key, value));
            } else {
                //This case is when there is a file attached with no message
                dispatch(setGlobalItem(key, {...value, message: ''}));
            }
        }
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
