// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Recording} from '@mattermost/types/recording';
import type {GlobalState} from '@mattermost/types/store';
import type {Typing} from '@mattermost/types/typing';
import type {UserProfile} from '@mattermost/types/users';
import type {IDMappedObjects} from '@mattermost/types/utilities';

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {getUsers} from 'mattermost-redux/selectors/entities/common';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

const getUsersImpl = <T extends (Typing | Recording)>(profiles: IDMappedObjects<UserProfile>, teammateNameDisplay: string, channelId: string, parentPostId: string, msgState: T): string[] => {
    const id = channelId + parentPostId;

    if (msgState[id]) {
        const users = Object.keys(msgState[id]);

        if (users.length) {
            return users.map((userId) => {
                return displayUsername(profiles[userId], teammateNameDisplay);
            });
        }
    }

    return [];
};

export function makeGetUsersTypingByChannelAndPost(): (state: GlobalState, props: {channelId: string; postId: string}) => string[] {
    return createSelector(
        'makeGetUsersTypingByChannelAndPost',
        getUsers,
        getTeammateNameDisplaySetting,
        (state: GlobalState, options: {channelId: string; postId: string}) => options.channelId,
        (state: GlobalState, options: {channelId: string; postId: string}) => options.postId,
        (state: GlobalState) => state.entities.typing,
        getUsersImpl,
    );
}

export function makeGetUsersRecordingByChannelAndPost(): (state: GlobalState, props: {channelId: string; postId: string}) => string[] {
    return createSelector(
        'makeGetUsersRecordingByChannelAndPost',
        getUsers,
        getTeammateNameDisplaySetting,
        (state: GlobalState, options: {channelId: string; postId: string}) => options.channelId,
        (state: GlobalState, options: {channelId: string; postId: string}) => options.postId,
        (state: GlobalState) => state.entities.recording,
        getUsersImpl,
    );
}
