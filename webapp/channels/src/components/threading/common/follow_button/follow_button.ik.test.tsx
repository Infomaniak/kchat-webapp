// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import FollowButton from './follow_button';

describe('FollowButton adblock bypass', () => {
    it('should use ThreadSubscribeBtn class instead of FollowButton to avoid adblock filters', () => {
        const wrapper = shallow(<FollowButton isFollowing={false}/>);
        const button = wrapper.find('Memo(Button)');

        expect(button.prop('className')).toBe('ThreadSubscribeBtn');
        expect(button.prop('className')).not.toBe('FollowButton');
    });

    it('should not contain FollowButton class anywhere in rendered output', () => {
        const wrapper = shallow(<FollowButton isFollowing={true}/>);
        const html = wrapper.debug();

        expect(html).not.toContain('className="FollowButton"');
        expect(html).toContain('ThreadSubscribeBtn');
    });
});
