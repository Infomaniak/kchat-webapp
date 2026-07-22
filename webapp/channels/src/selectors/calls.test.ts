// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {General} from 'mattermost-redux/constants';

import type {GlobalState} from 'types/store';

import {canCallInChannel} from './calls';

describe('Selectors.Calls', () => {
    const currentUserId = 'user_1';
    const otherUserId = 'user_2';
    const deactivatedUserId = 'user_3';
    const botUserId = 'bot_1';

    const mockState = {
        entities: {
            users: {
                currentUserId,
                profiles: {
                    [currentUserId]: {id: currentUserId, roles: 'system_user', delete_at: 0},
                    [otherUserId]: {id: otherUserId, delete_at: 0},
                    [deactivatedUserId]: {id: deactivatedUserId, delete_at: 1234},
                    [botUserId]: {id: botUserId, delete_at: 0, is_bot: true},
                },
            },
        },
    } as unknown as GlobalState;

    test('should return false when channel is undefined', () => {
        expect(canCallInChannel(mockState, undefined)).toBe(false);
    });

    test('should return false when channel is archived', () => {
        const channel = {id: 'ch_5', type: General.OPEN_CHANNEL, delete_at: 1234, name: 'archived'} as any;
        expect(canCallInChannel(mockState, channel)).toBe(false);
    });

    test('should return true for public channels', () => {
        const channel = {id: 'ch_1', type: General.OPEN_CHANNEL, delete_at: 0, name: 'public'} as any;
        expect(canCallInChannel(mockState, channel)).toBe(true);
    });

    test('should return true for DM with active user', () => {
        const channel = {id: 'ch_2', type: General.DM_CHANNEL, delete_at: 0, name: `${currentUserId}__${otherUserId}`} as any;
        expect(canCallInChannel(mockState, channel)).toBe(true);
    });

    test('should return false for DM with deactivated user', () => {
        const channel = {id: 'ch_3', type: General.DM_CHANNEL, delete_at: 0, name: `${currentUserId}__${deactivatedUserId}`} as any;
        expect(canCallInChannel(mockState, channel)).toBe(false);
    });

    test('should return false for DM with bot user', () => {
        const channel = {id: 'ch_4', type: General.DM_CHANNEL, delete_at: 0, name: `${currentUserId}__${botUserId}`} as any;
        expect(canCallInChannel(mockState, channel)).toBe(false);
    });

    test('should return false for DM with self', () => {
        const channel = {id: 'ch_6', type: General.DM_CHANNEL, delete_at: 0, name: `${currentUserId}__${currentUserId}`} as any;
        expect(canCallInChannel(mockState, channel)).toBe(false);
    });
});
