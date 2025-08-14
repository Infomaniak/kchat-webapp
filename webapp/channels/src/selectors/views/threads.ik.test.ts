// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CREATE_COMMENT} from 'mattermost-redux/utils/post_list';

import type {GlobalState} from 'types/store';

import * as selectors from './threads';

describe('selectors/views/threads', () => {
    const latestPost = {
        id: 'latest_post_id',
        user_id: 'current_user_id',
        message: 'test msg',
        channel_id: 'current_channel_id',
        create_at: new Date().getTime(),
    };
    const makeState = () => ({
        entities: {
            teams: {
                currentTeamId: 'current_team_id',
            },
            posts: {
                posts: {
                    [latestPost.id]: latestPost,
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {},
                },
            },
        },
    }) as unknown as GlobalState;

    describe('makeFilterRepliesAndAddSeparators', () => {
        test('should not contain CREATE_COMMENT token', () => {
            const state = makeState();
            const postIds = selectors.makeFilterRepliesAndAddSeparators()(state, {
                postIds: ['latest_post_id'],
                showDate: true,
            });
            expect(postIds.indexOf(CREATE_COMMENT)).toBe(-1);
        });
    });
});
