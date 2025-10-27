// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ScheduledPostTypes} from 'mattermost-redux/action_types';
import reducer from 'mattermost-redux/reducers/entities/scheduled_posts';

describe('reducers/entities/scheduled_posts', () => {
    describe('SINGLE_SCHEDULED_POST_RECEIVED - Non-regression tests', () => {
        const mockScheduledPost = {
            id: 'post_123',
            channel_id: 'channel_456',
            user_id: 'user_789',
            message: 'Test scheduled post',
            scheduled_at: 1672531200000,
            root_id: '',
            error_code: null,
        };

        const initialState = {
            byId: {},
            byTeamId: {},
            byChannelOrThreadId: {},
            errorsByTeamId: {},
        };

        it('should handle undefined newState[teamId] without throwing findIndex error', () => {
            const state = {
                ...initialState,
                byTeamId: {},
            };

            const action = {
                type: ScheduledPostTypes.SINGLE_SCHEDULED_POST_RECEIVED,
                data: {
                    scheduledPost: mockScheduledPost,
                    teamId: 'new_team_that_does_not_exist',
                },
            };

            expect(() => {
                reducer(state, action);
            }).not.toThrow();

            const newState = reducer(state, action);
            expect(newState.byTeamId.new_team_that_does_not_exist).toEqual(['post_123']);
        });
    });
});
