// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import MsgTyping from 'components/msg_typing/msg_typing';

describe('components/MsgTyping', () => {
    const baseProps = {
        typingUsers: [],
        recordingUsers: [],
        channelId: 'test',
        rootId: '',
        currentUserId: '',
        userStartedTyping: jest.fn(),
        userStoppedTyping: jest.fn(),
        userStartedRecording: jest.fn(),
        userStoppedRecording: jest.fn(),
    };

    test('should match snapshot, on one user recording', () => {
        const recordingUsers = ['test.user'];
        const props = {...baseProps, recordingUsers};

        const wrapper = shallow(<MsgTyping {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on multiple users recording', () => {
        const recordingUsers = ['test.user', 'other.test.user', 'another.user'];
        const props = {...baseProps, recordingUsers};

        const wrapper = shallow(<MsgTyping {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
