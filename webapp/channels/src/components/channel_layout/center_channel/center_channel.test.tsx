// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import CenterChannel from './center_channel';

import type {OwnProps} from './index';

jest.mock('components/advanced_text_editor/voice_message_attachment', () => () => <div/>);

describe('components/channel_layout/CenterChannel', () => {
    const props = {
        location: {
            pathname: '/some',
        } as OwnProps['location'],
        match: {
            url: '/url',
        } as OwnProps['match'],
        history: {} as OwnProps['history'],
        lastChannelPath: '',
        lhsOpen: true,
        rhsOpen: true,
        rhsMenuOpen: true,
        isCollapsedThreadsEnabled: true,
        currentUserId: 'testUserId',
        callChannel: {
            create_at: 1508265709607,
            creator_id: 'zaktnt8bpbgu8mb6ez9k64r7sa',
            delete_at: 0,
            display_name: 'testing',
            header: 'test',
            id: 'owsyt8n43jfxjpzh9np93mx1wa',
            last_post_at: 1508265709635,
            name: 'testing',
            purpose: 'test',
            team_id: 'eatxocwc3bg9ffo9xyybnj4omr',
            type: 'O',
            update_at: 1508265709607,
            last_root_post_at: 1508265709607,
            scheme_id: 'owsyt8n43jfxjpzh9np93mx1wa',
            group_constrained: true,
        },
        callExpandedView: true,
        insightsAreEnabled: true,
        isMobileView: false,
        actions: {
            getProfiles: jest.fn,
        },
    };
    test('should call update returnTo on props change', () => {
        const wrapper = shallow(<CenterChannel {...props}/>);

        expect(wrapper.state('returnTo')).toBe('');

        wrapper.setProps({
            location: {
                pathname: '/pl/path',
            },
        });
        expect(wrapper.state('returnTo')).toBe('/some');
        wrapper.setProps({
            location: {
                pathname: '/pl/path1',
            },
        });
        expect(wrapper.state('returnTo')).toBe('/pl/path');
    });
});
