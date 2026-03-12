import type {GlobalState} from '@mattermost/types/store';

import {isCurrentUserInChannelGroup} from 'mattermost-redux/selectors/entities/groups';
import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';

describe('isCurrentUserInChannelGroup', () => {
    const channelID = 'channel-1';
    const groupA = 'group-a';
    const groupB = 'group-b';
    const groupC = 'group-c';

    const baseState = deepFreezeAndThrowOnMutation({
        entities: {
            groups: {
                syncables: {},
                members: {},
                groups: {},
                myGroups: [groupA, groupB],
            },
            channels: {
                channels: {},
                groupsAssociatedToChannel: {
                    [channelID]: {ids: [groupB, groupC]},
                },
            },
            teams: {
                teams: {},
                groupsAssociatedToTeam: {},
            },
            general: {config: {}},
            preferences: {myPreferences: {}},
            users: {currentUserId: 'user-1', profiles: {}},
        },
    }) as unknown as GlobalState;

    it('should return true when user belongs to a group linked to the channel', () => {
        expect(isCurrentUserInChannelGroup(baseState, channelID)).toBe(true);
    });

    it('should return false when user does not belong to any group linked to the channel', () => {
        const state = {
            ...baseState,
            entities: {
                ...baseState.entities,
                groups: {
                    ...baseState.entities.groups,
                    myGroups: ['group-x'],
                },
            },
        } as unknown as GlobalState;
        expect(isCurrentUserInChannelGroup(state, channelID)).toBe(false);
    });

    it('should return false when channel has no associated groups', () => {
        expect(isCurrentUserInChannelGroup(baseState, 'unknown-channel')).toBe(false);
    });

    it('should return false when user has no groups', () => {
        const state = {
            ...baseState,
            entities: {
                ...baseState.entities,
                groups: {
                    ...baseState.entities.groups,
                    myGroups: [],
                },
            },
        } as unknown as GlobalState;
        expect(isCurrentUserInChannelGroup(state, channelID)).toBe(false);
    });
});
