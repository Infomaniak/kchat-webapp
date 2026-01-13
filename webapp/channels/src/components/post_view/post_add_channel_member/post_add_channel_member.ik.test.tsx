// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Integration Knowledge Test
 *
 * This test verifies custom features specific to this fork that differ from upstream mattermost.
 * If this test fails after syncing with upstream, it means we need to re-apply our custom changes.
 */

import {shallow} from 'enzyme';
import React from 'react';

import type {Post} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import PostAddChannelMember from 'components/post_view/post_add_channel_member/post_add_channel_member';
import type {Props} from 'components/post_view/post_add_channel_member/post_add_channel_member';

import {TestHelper} from 'utils/test_helper';

describe('components/post_view/PostAddChannelMember - Custom Fork Features', () => {
    const post: Post = TestHelper.getPostMock({
        id: 'post_id_1',
        root_id: 'root_id',
        channel_id: 'channel_id',
        create_at: 1,
        props: {
            add_channel_member: {
                original_post_id: 'original_post_id',
            },
        },
    });
    const currentUser: UserProfile = TestHelper.getUserMock({
        id: 'current_user_id',
        username: 'current_username',
    });
    const requiredProps: Props = {
        currentUser,
        channelType: 'O',
        postId: 'post_id_1',
        post,
        userIds: ['user_id_1'],
        usernames: ['username_1'],
        actions: {
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
            notifyChannelMember: jest.fn(),
        },
        noGroupsUsernames: [],
    };

    describe('CUSTOM FEATURE: Notify users option for public channels', () => {
        test('should have notifyChannelMember action in props', () => {
            // This action does NOT exist in upstream mattermost
            expect(requiredProps.actions.notifyChannelMember).toBeDefined();
            expect(typeof requiredProps.actions.notifyChannelMember).toBe('function');
        });

        test('should have handleNotifyChannelMember method', () => {
            const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
            const instance = wrapper.instance() as PostAddChannelMember;

            // This method does NOT exist in upstream mattermost
            expect(instance.handleNotifyChannelMember).toBeDefined();
            expect(typeof instance.handleNotifyChannelMember).toBe('function');
        });

        test('should use post_body.check_for_out_of_channel_mentions.public_with_notify translation key for public channels', () => {
            // Upstream uses separate keys without notify option
            // Our fork uses a single key with both "add" and "notify" options
            const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
            const formattedMessage = wrapper.find('MemoizedFormattedMessage').first();

            expect(formattedMessage.prop('id')).toBe('post_body.check_for_out_of_channel_mentions.public_with_notify');
        });

        test('should pass notifyLink callback to FormattedMessage for public channels', () => {
            const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
            const formattedMessage = wrapper.find('MemoizedFormattedMessage').first();
            const values = formattedMessage.prop('values') as unknown as Record<string, unknown>;

            // Upstream does NOT have this notifyLink callback
            expect(values.notifyLink).toBeDefined();
            expect(typeof values.notifyLink).toBe('function');
        });

        test('notifyLink should render a link with PostBody_addChannelMemberLink-notify class', () => {
            const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
            const formattedMessage = wrapper.find('MemoizedFormattedMessage').first();
            const values = formattedMessage.prop('values') as unknown as Record<string, unknown>;
            const {notifyLink} = values;

            const linkElement = (notifyLink as (chunks: React.ReactNode) => React.ReactElement)('notify them');

            // Upstream does NOT have this CSS class
            expect(linkElement.props.className).toBe('PostBody_addChannelMemberLink-notify');
            expect(linkElement.type).toBe('a');
        });

        test('notifyLink onClick should call handleNotifyChannelMember', () => {
            const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
            const instance = wrapper.instance() as PostAddChannelMember;
            const formattedMessage = wrapper.find('MemoizedFormattedMessage').first();
            const values = formattedMessage.prop('values') as unknown as Record<string, unknown>;
            const {notifyLink} = values;

            const linkElement = (notifyLink as (chunks: React.ReactNode) => React.ReactElement)('notify them');

            expect(linkElement.props.onClick).toBe(instance.handleNotifyChannelMember);
        });

        test('handleNotifyChannelMember should call notifyChannelMember action', () => {
            const actions = {
                removePost: jest.fn(),
                addChannelMember: jest.fn(),
                notifyChannelMember: jest.fn(),
            };
            const props: Props = {
                ...requiredProps,
                actions,
                userIds: ['user_id_1', 'user_id_2'],
            };
            const wrapper = shallow(<PostAddChannelMember {...props}/>);
            const instance = wrapper.instance() as PostAddChannelMember;

            instance.handleNotifyChannelMember();

            // Upstream does NOT call this action
            expect(actions.notifyChannelMember).toHaveBeenCalledTimes(1);
            expect(actions.notifyChannelMember).toHaveBeenCalledWith(
                post.channel_id,
                props.userIds,
                expect.any(String), // original_post_id from post.props
            );
            expect(actions.removePost).toHaveBeenCalledWith(post);
        });

        test('private channels should NOT have notify option (only add option)', () => {
            const props: Props = {
                ...requiredProps,
                channelType: 'P',
            };
            const wrapper = shallow(<PostAddChannelMember {...props}/>);
            const formattedMessage = wrapper.find('MemoizedFormattedMessage').first();

            // Private channels use different translation key without notify option
            expect(formattedMessage.prop('id')).toBe('post_body.check_for_out_of_channel_mentions.private');

            const values = formattedMessage.prop('values') as unknown as Record<string, unknown>;

            // Should have addLink but NOT notifyLink
            expect(values.addLink).toBeDefined();
            expect(values.notifyLink).toBeUndefined();
        });
    });

    describe('CUSTOM FEATURE: Enhanced translations with FormattedMessage callbacks', () => {
        test('should use FormattedMessage with callback functions instead of separate message parts', () => {
            // Upstream concatenates multiple FormattedMessage components with links between them
            // Our fork uses a single FormattedMessage with callback functions for better i18n
            const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
            const formattedMessage = wrapper.find('MemoizedFormattedMessage').first();
            const values = formattedMessage.prop('values') as unknown as Record<string, unknown>;

            expect(values.addLink).toBeDefined();
            expect(values.mentions).toBeDefined();
            expect(typeof values.addLink).toBe('function');
            expect(typeof values.mentions).toBe('function');
        });

        test('should use new translation key post_body.check_for_out_of_channel_groups_mentions with callbacks', () => {
            const props: Props = {
                ...requiredProps,
                noGroupsUsernames: ['user_no_group'],
            };
            const wrapper = shallow(<PostAddChannelMember {...props}/>);
            const formattedMessages = wrapper.find('MemoizedFormattedMessage');

            // Find the groups message (should be the second one)
            const groupsMessage = formattedMessages.at(1);

            expect(groupsMessage.prop('id')).toBe('post_body.check_for_out_of_channel_groups_mentions');

            const values = groupsMessage.prop('values') as unknown as Record<string, unknown>;
            expect(values.mentions).toBeDefined();
            expect(typeof values.mentions).toBe('function');
        });
    });
});
