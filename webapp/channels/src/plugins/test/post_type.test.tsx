// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow, mount} from 'enzyme';
import React from 'react';

import {Preferences} from 'mattermost-redux/constants';

import PostMessageView from 'components/post_view/post_message_view/post_message_view';

const PostTypePlugin = () => (
    <span id='pluginId'>{'PostTypePlugin'}</span>
);

describe('plugins/PostMessageView', () => {
    const post = {type: 'testtype', message: 'this is some text', id: 'post_id'} as any;
    const pluginPostTypes = {
        testtype: {component: PostTypePlugin},
    };

    const requiredProps = {
        post,
        pluginPostTypes,
        currentUser: {username: 'username'},
        team: {name: 'team_name'},
        emojis: {name: 'smile'},
        theme: Preferences.THEMES.denim,
        enableFormatting: true,
        currentRelativeTeamUrl: 'team_url',
    };

    test('should match snapshot with extended post type', () => {
        const wrapper = mount(
            <PostMessageView {...requiredProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('PostTypePlugin');
    });

    test('should match snapshot with no extended post type', () => {
        const props = {...requiredProps, pluginPostTypes: {}};
        const wrapper = shallow(
            <PostMessageView {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
