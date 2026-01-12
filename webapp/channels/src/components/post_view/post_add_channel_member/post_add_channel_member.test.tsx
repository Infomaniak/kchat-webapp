// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {Post} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {sendAddToChannelEphemeralPost} from 'actions/global_actions';

import PostAddChannelMember from 'components/post_view/post_add_channel_member/post_add_channel_member';
import type {Props} from 'components/post_view/post_add_channel_member/post_add_channel_member';

import {TestHelper} from 'utils/test_helper';

jest.mock('actions/global_actions', () => {
    return {
        sendAddToChannelEphemeralPost: jest.fn(),
    };
});

describe('components/post_view/PostAddChannelMember', () => {
    const post: Post = TestHelper.getPostMock({
        id: 'post_id_1',
        root_id: 'root_id',
        channel_id: 'channel_id',
        create_at: 1,
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

    test('should match snapshot, empty postId', () => {
        const props: Props = {
            ...requiredProps,
            postId: '',
        };
        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, empty channelType', () => {
        const props: Props = {
            ...requiredProps,
            channelType: '',
        };
        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, public channel', () => {
        const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, private channel', () => {
        const props: Props = {
            ...requiredProps,
            channelType: 'P',
        };

        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, more than 3 users', () => {
        const userIds = ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4'];
        const usernames = ['username_1', 'username_2', 'username_3', 'username_4'];
        const props: Props = {
            ...requiredProps,
            userIds,
            usernames,
        };

        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper.state('expanded')).toEqual(false);
        expect(wrapper).toMatchSnapshot();

        // Call expand handler directly since the link is rendered inside FormattedMessage
        (wrapper.instance() as PostAddChannelMember).expand();
        wrapper.update();
        expect(wrapper.state('expanded')).toEqual(true);
        expect(wrapper).toMatchSnapshot();
    });

    test('actions should have been called', () => {
        const actions = {
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
            notifyChannelMember: jest.fn(),
        };
        const props: Props = {...requiredProps, actions};
        const wrapper = shallow(
            <PostAddChannelMember {...props}/>,
        );

        // Call handler directly since the link is rendered inside FormattedMessage
        (wrapper.instance() as PostAddChannelMember).handleAddChannelMember();

        expect(actions.addChannelMember).toHaveBeenCalledTimes(1);
        expect(actions.addChannelMember).toHaveBeenCalledWith(post.channel_id, requiredProps.userIds[0], post.root_id);
        expect(sendAddToChannelEphemeralPost).toHaveBeenCalledTimes(1);
        expect(sendAddToChannelEphemeralPost).toHaveBeenCalledWith(props.currentUser, props.usernames[0], props.userIds[0], post.channel_id, post.root_id, 2);
        expect(actions.removePost).toHaveBeenCalledTimes(1);
        expect(actions.removePost).toHaveBeenCalledWith(post);
    });

    test('addChannelMember should have been called multiple times', () => {
        const userIds = ['user_id_1', 'user_id_2', 'user_id_3', 'user_id_4'];
        const usernames = ['username_1', 'username_2', 'username_3', 'username_4'];
        const actions = {
            removePost: jest.fn(),
            addChannelMember: jest.fn(),
            notifyChannelMember: jest.fn(),
        };
        const props: Props = {...requiredProps, userIds, usernames, actions};
        const wrapper = shallow(
            <PostAddChannelMember {...props}/>,
        );

        // Call handler directly since the link is rendered inside FormattedMessage
        (wrapper.instance() as PostAddChannelMember).handleAddChannelMember();
        expect(actions.addChannelMember).toHaveBeenCalledTimes(4);
    });

    test('handleAddChannelMember should be passed to FormattedMessage addLink callback', () => {
        const wrapper = shallow(<PostAddChannelMember {...requiredProps}/>);
        const formattedMessage = wrapper.find('MemoizedFormattedMessage').first();
        const values = formattedMessage.prop('values');
        expect(values).toBeDefined();

        const {addLink} = values as unknown as Record<string, unknown>;

        // Verify that addLink is a function
        expect(typeof addLink).toBe('function');

        // Create a mock onClick and verify it gets called when the link would be clicked
        const instance = wrapper.instance() as PostAddChannelMember;
        const handleAddSpy = jest.spyOn(instance, 'handleAddChannelMember');

        // Simulate what happens when FormattedMessage renders the addLink
        const linkElement = (addLink as (chunks: React.ReactNode) => React.ReactElement)('test content');
        expect(linkElement.props.className).toBe('PostBody_addChannelMemberLink');
        expect(linkElement.props.onClick).toBe(instance.handleAddChannelMember);

        // Verify clicking the link calls the handler
        linkElement.props.onClick();
        expect(handleAddSpy).toHaveBeenCalledTimes(1);
    });

    test('should match snapshot, with no-groups usernames', () => {
        const props: Props = {
            ...requiredProps,
            noGroupsUsernames: ['user_id_2'],
        };
        const wrapper = shallow(<PostAddChannelMember {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
