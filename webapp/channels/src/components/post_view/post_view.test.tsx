// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {Preferences} from 'mattermost-redux/constants';

import PostList from './post_list';
import PostView from './post_view';

// can't find a way to make jest tread wasm-media-encoders as en ESModule, this is a workaround
jest.mock('wasm-media-encoders', () => ({
    createEncoder: jest.fn(() => ({
        encode: jest.fn(),
        flush: jest.fn(),
        close: jest.fn(),
    })),
}));

describe('components/post_view/post_view', () => {
    const baseProps = {
        lastViewedAt: 12345678,
        isFirstLoad: false,
        channelLoading: false,
        channelId: '1234',
        focusedPostId: '12345',
        unreadScrollPosition: Preferences.UNREAD_SCROLL_POSITION_START_FROM_LEFT,
        isThreadView: false,
    };
    jest.useFakeTimers();

    let rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 16));
    beforeEach(() => {
        rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 16));
    });

    afterEach(() => {
        rafSpy.mockRestore();
    });

    test('should match snapshot for channel loading', () => {
        const wrapper = shallow(<PostView {...{...baseProps, channelLoading: true}}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for loaderForChangeOfPostsChunk', () => {
        const wrapper = shallow(<PostView {...baseProps}/>);
        wrapper.setState({loaderForChangeOfPostsChunk: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('unreadChunkTimeStamp should be set for first load of channel', () => {
        const wrapper = shallow(<PostView {...{...baseProps, isFirstLoad: true}}/>);
        expect(wrapper.state('unreadChunkTimeStamp')).toEqual(baseProps.lastViewedAt);
    });

    test('changeUnreadChunkTimeStamp', () => {
        const wrapper = shallow(<PostView {...{...baseProps, isFirstLoad: true}}/>);
        expect(wrapper.state('unreadChunkTimeStamp')).toEqual(baseProps.lastViewedAt);
        wrapper.find(PostList).prop<(lastViewedAt?: string) => void>('changeUnreadChunkTimeStamp')('1234678');
        expect(wrapper.state('unreadChunkTimeStamp')).toEqual('1234678');
        expect(wrapper.state('loaderForChangeOfPostsChunk')).toEqual(true);
        jest.runOnlyPendingTimers();
        expect(wrapper.state('loaderForChangeOfPostsChunk')).toEqual(false);
    });
});
