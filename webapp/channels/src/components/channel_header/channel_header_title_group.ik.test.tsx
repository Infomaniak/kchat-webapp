// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ChannelHeaderTitleGroup from 'components/channel_header/channel_header_title_group';

import {TestHelper} from 'utils/test_helper';

import {renderWithContext} from 'tests/react_testing_utils';

describe('components/ChannelHeaderTitleGroup - IK Custom Tests', () => {
    describe('current user filtering', () => {
        test('should filter out current user from display names immediately', () => {
            const channels = {
                channels: {
                    channel_id: {
                        id: 'channel_id',
                        display_name: 'alice, bob, charlie',
                    },
                },
                currentChannelId: 'channel_id',
            };

            const users = {
                profiles: {
                    alice_id: {
                        id: 'alice_id',
                        username: 'alice',
                        roles: 'system_user',
                    },
                    bob_id: {
                        id: 'bob_id',
                        username: 'bob',
                        roles: 'system_user',
                    },
                    charlie_id: {
                        id: 'charlie_id',
                        username: 'charlie',
                        roles: 'system_user',
                    },
                },
                currentUserId: 'bob_id',
            };

            const state = {
                entities: {
                    channels,
                    users,
                },
            };

            const gmMembers = [
                TestHelper.getUserMock({
                    id: 'alice_id',
                    username: 'alice',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'bob_id',
                    username: 'bob',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'charlie_id',
                    username: 'charlie',
                    roles: 'system_user',
                }),
            ];

            const wrapper = renderWithContext(
                <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
                state,
            );

            const container = wrapper.container;
            const text = container.textContent;

            // Current user (bob) should not appear in the display
            expect(text).not.toContain('bob');
            expect(text).toContain('alice');
            expect(text).toContain('charlie');
        });

        test('should handle case where current user is first in display_name list', () => {
            const channels = {
                channels: {
                    channel_id: {
                        id: 'channel_id',
                        display_name: 'bob, alice, charlie',
                    },
                },
                currentChannelId: 'channel_id',
            };

            const users = {
                profiles: {
                    bob_id: {
                        id: 'bob_id',
                        username: 'bob',
                        roles: 'system_user',
                    },
                },
                currentUserId: 'bob_id',
            };

            const state = {
                entities: {
                    channels,
                    users,
                },
            };

            const gmMembers = [
                TestHelper.getUserMock({
                    id: 'bob_id',
                    username: 'bob',
                    roles: 'system_user',
                }),
            ];

            const wrapper = renderWithContext(
                <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
                state,
            );

            const container = wrapper.container;
            const text = container.textContent;

            expect(text).not.toContain('bob');
            expect(text).toContain('alice');
            expect(text).toContain('charlie');
        });

        test('should handle case where current user is last in display_name list', () => {
            const channels = {
                channels: {
                    channel_id: {
                        id: 'channel_id',
                        display_name: 'alice, charlie, bob',
                    },
                },
                currentChannelId: 'channel_id',
            };

            const users = {
                profiles: {
                    bob_id: {
                        id: 'bob_id',
                        username: 'bob',
                        roles: 'system_user',
                    },
                },
                currentUserId: 'bob_id',
            };

            const state = {
                entities: {
                    channels,
                    users,
                },
            };

            const gmMembers = [
                TestHelper.getUserMock({
                    id: 'bob_id',
                    username: 'bob',
                    roles: 'system_user',
                }),
            ];

            const wrapper = renderWithContext(
                <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
                state,
            );

            const container = wrapper.container;
            const text = container.textContent;

            expect(text).not.toContain('bob');
            expect(text).toContain('alice');
            expect(text).toContain('charlie');
        });
    });

    describe('comma separation for names not in membersMap', () => {
        test('should properly add commas when displayName is not in membersMap', () => {
            const channels = {
                channels: {
                    channel_id: {
                        id: 'channel_id',
                        display_name: 'alice, unknown_user, charlie',
                    },
                },
                currentChannelId: 'channel_id',
            };

            const users = {
                profiles: {
                    alice_id: {
                        id: 'alice_id',
                        username: 'alice',
                        roles: 'system_user',
                    },
                    charlie_id: {
                        id: 'charlie_id',
                        username: 'charlie',
                        roles: 'system_user',
                    },
                    current_id: {
                        id: 'current_id',
                        username: 'current',
                        roles: 'system_user',
                    },
                },
                currentUserId: 'current_id',
            };

            const state = {
                entities: {
                    channels,
                    users,
                },
            };

            // gmMembers doesn't include unknown_user
            const gmMembers = [
                TestHelper.getUserMock({
                    id: 'alice_id',
                    username: 'alice',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'charlie_id',
                    username: 'charlie',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'current_id',
                    username: 'current',
                    roles: 'system_user',
                }),
            ];

            const wrapper = renderWithContext(
                <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
                state,
            );

            const container = wrapper.container;
            const text = container.textContent;

            // All names should be present
            expect(text).toContain('alice');
            expect(text).toContain('unknown_user');
            expect(text).toContain('charlie');

            // Should be properly comma-separated (no missing commas)
            expect(text).toMatch(/alice.*,.*unknown_user.*,.*charlie/);
        });

        test('should properly add commas when first displayName is not in membersMap', () => {
            const channels = {
                channels: {
                    channel_id: {
                        id: 'channel_id',
                        display_name: 'unknown_user, alice, charlie',
                    },
                },
                currentChannelId: 'channel_id',
            };

            const users = {
                profiles: {
                    alice_id: {
                        id: 'alice_id',
                        username: 'alice',
                        roles: 'system_user',
                    },
                    charlie_id: {
                        id: 'charlie_id',
                        username: 'charlie',
                        roles: 'system_user',
                    },
                    current_id: {
                        id: 'current_id',
                        username: 'current',
                        roles: 'system_user',
                    },
                },
                currentUserId: 'current_id',
            };

            const state = {
                entities: {
                    channels,
                    users,
                },
            };

            const gmMembers = [
                TestHelper.getUserMock({
                    id: 'alice_id',
                    username: 'alice',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'charlie_id',
                    username: 'charlie',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'current_id',
                    username: 'current',
                    roles: 'system_user',
                }),
            ];

            const wrapper = renderWithContext(
                <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
                state,
            );

            const container = wrapper.container;
            const text = container.textContent;

            // First name should NOT have a leading comma
            expect(text).toMatch(/^unknown_user.*,.*alice.*,.*charlie/);
        });

        test('should properly add commas when multiple consecutive displayNames are not in membersMap', () => {
            const channels = {
                channels: {
                    channel_id: {
                        id: 'channel_id',
                        display_name: 'alice, unknown1, unknown2, charlie',
                    },
                },
                currentChannelId: 'channel_id',
            };

            const users = {
                profiles: {
                    alice_id: {
                        id: 'alice_id',
                        username: 'alice',
                        roles: 'system_user',
                    },
                    charlie_id: {
                        id: 'charlie_id',
                        username: 'charlie',
                        roles: 'system_user',
                    },
                    current_id: {
                        id: 'current_id',
                        username: 'current',
                        roles: 'system_user',
                    },
                },
                currentUserId: 'current_id',
            };

            const state = {
                entities: {
                    channels,
                    users,
                },
            };

            const gmMembers = [
                TestHelper.getUserMock({
                    id: 'alice_id',
                    username: 'alice',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'charlie_id',
                    username: 'charlie',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'current_id',
                    username: 'current',
                    roles: 'system_user',
                }),
            ];

            const wrapper = renderWithContext(
                <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
                state,
            );

            const container = wrapper.container;
            const text = container.textContent;

            // All commas should be present
            expect(text).toMatch(/alice.*,.*unknown1.*,.*unknown2.*,.*charlie/);
        });
    });

    describe('combined scenarios - current user filtering + comma handling', () => {
        test('should filter current user and properly add commas when unknown users are present', () => {
            const channels = {
                channels: {
                    channel_id: {
                        id: 'channel_id',
                        display_name: 'bob, alice, unknown_user, charlie',
                    },
                },
                currentChannelId: 'channel_id',
            };

            const users = {
                profiles: {
                    alice_id: {
                        id: 'alice_id',
                        username: 'alice',
                        roles: 'system_user',
                    },
                    bob_id: {
                        id: 'bob_id',
                        username: 'bob',
                        roles: 'system_user',
                    },
                    charlie_id: {
                        id: 'charlie_id',
                        username: 'charlie',
                        roles: 'system_user',
                    },
                },
                currentUserId: 'bob_id',
            };

            const state = {
                entities: {
                    channels,
                    users,
                },
            };

            const gmMembers = [
                TestHelper.getUserMock({
                    id: 'alice_id',
                    username: 'alice',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'bob_id',
                    username: 'bob',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'charlie_id',
                    username: 'charlie',
                    roles: 'system_user',
                }),
            ];

            const wrapper = renderWithContext(
                <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
                state,
            );

            const container = wrapper.container;
            const text = container.textContent;

            // Current user should be filtered
            expect(text).not.toContain('bob');

            // Others should be present and properly comma-separated
            expect(text).toMatch(/alice.*,.*unknown_user.*,.*charlie/);
        });

        test('should handle when current user is removed and first remaining name is not in membersMap', () => {
            const channels = {
                channels: {
                    channel_id: {
                        id: 'channel_id',
                        display_name: 'bob, unknown_user, alice',
                    },
                },
                currentChannelId: 'channel_id',
            };

            const users = {
                profiles: {
                    alice_id: {
                        id: 'alice_id',
                        username: 'alice',
                        roles: 'system_user',
                    },
                    bob_id: {
                        id: 'bob_id',
                        username: 'bob',
                        roles: 'system_user',
                    },
                },
                currentUserId: 'bob_id',
            };

            const state = {
                entities: {
                    channels,
                    users,
                },
            };

            const gmMembers = [
                TestHelper.getUserMock({
                    id: 'alice_id',
                    username: 'alice',
                    roles: 'system_user',
                }),
                TestHelper.getUserMock({
                    id: 'bob_id',
                    username: 'bob',
                    roles: 'system_user',
                }),
            ];

            const wrapper = renderWithContext(
                <ChannelHeaderTitleGroup gmMembers={gmMembers}/>,
                state,
            );

            const container = wrapper.container;
            const text = container.textContent;

            // Current user should be filtered
            expect(text).not.toContain('bob');

            // First item after filtering should NOT have a leading comma
            expect(text).toMatch(/^unknown_user.*,.*alice/);
        });
    });
});
