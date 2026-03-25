// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {WebSocketMessage} from '@mattermost/client';

import MsgTyping from 'components/msg_typing/msg_typing';

import {SocketEvents} from 'utils/constants';

let wsHandler: ((msg: WebSocketMessage) => void) | undefined;
jest.mock('utils/use_websocket', () => ({
    useWebSocket: ({handler}: {handler: (msg: WebSocketMessage) => void}) => {
        wsHandler = handler;
    },
}));

describe('components/MsgTyping', () => {
    const baseProps = {
        typingUsers: [],
        recordingUsers: [],
        channelId: 'channel1',
        rootId: '',
        currentUserId: 'me',
        userStartedTyping: jest.fn(),
        userStoppedTyping: jest.fn(),
        userStartedRecording: jest.fn(),
        userStoppedRecording: jest.fn(),
        rhsSelectedPostId: '',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        wsHandler = undefined;
    });

    it('should match snapshot, on one user recording', () => {
        const recordingUsers = ['test.user'];
        const props = {...baseProps, recordingUsers};

        const wrapper = shallow(<MsgTyping {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot, on multiple users recording', () => {
        const recordingUsers = ['test.user', 'other.test.user', 'another.user'];
        const props = {...baseProps, recordingUsers};

        const wrapper = shallow(<MsgTyping {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    describe('thread typing visibility', () => {
        const typingMsg = (channelId: string, parentId: string, userId: string): WebSocketMessage => ({
            event: SocketEvents.TYPING,
            data: {data: {channel_id: channelId, parent_id: parentId, user_id: userId}},
        } as unknown as WebSocketMessage);

        const recordingMsg = (channelId: string, parentId: string, userId: string): WebSocketMessage => ({
            event: SocketEvents.RECORDING,
            data: {data: {channel_id: channelId, parent_id: parentId, user_id: userId}},
        } as unknown as WebSocketMessage);

        it('should dispatch typing with rootId when thread is open in RHS', () => {
            const props = {...baseProps, rhsSelectedPostId: 'thread1'};
            shallow(<MsgTyping {...props}/>);

            wsHandler!(typingMsg('channel1', 'thread1', 'other-user'));

            expect(props.userStartedTyping).toHaveBeenCalledWith('other-user', 'channel1', 'thread1', expect.any(Number));
        });

        it('should dispatch typing with empty rootId when thread is NOT open in RHS', () => {
            const props = {...baseProps, rhsSelectedPostId: ''};
            shallow(<MsgTyping {...props}/>);

            wsHandler!(typingMsg('channel1', 'thread1', 'other-user'));

            expect(props.userStartedTyping).toHaveBeenCalledWith('other-user', 'channel1', '', expect.any(Number));
        });

        it('should dispatch typing with empty rootId when a different thread is open in RHS', () => {
            const props = {...baseProps, rhsSelectedPostId: 'other-thread'};
            shallow(<MsgTyping {...props}/>);

            wsHandler!(typingMsg('channel1', 'thread1', 'other-user'));

            expect(props.userStartedTyping).toHaveBeenCalledWith('other-user', 'channel1', '', expect.any(Number));
        });

        it('should dispatch recording with rootId when thread is open in RHS', () => {
            const props = {...baseProps, rhsSelectedPostId: 'thread1'};
            shallow(<MsgTyping {...props}/>);

            wsHandler!(recordingMsg('channel1', 'thread1', 'other-user'));

            expect(props.userStartedRecording).toHaveBeenCalledWith('other-user', 'channel1', 'thread1', expect.any(Number));
        });

        it('should dispatch recording with empty rootId when thread is NOT open in RHS', () => {
            const props = {...baseProps, rhsSelectedPostId: ''};
            shallow(<MsgTyping {...props}/>);

            wsHandler!(recordingMsg('channel1', 'thread1', 'other-user'));

            expect(props.userStartedRecording).toHaveBeenCalledWith('other-user', 'channel1', '', expect.any(Number));
        });

        it('should dispatch channel-level typing when message has no rootId', () => {
            const props = {...baseProps, rhsSelectedPostId: 'thread1'};
            shallow(<MsgTyping {...props}/>);

            wsHandler!(typingMsg('channel1', '', 'other-user'));

            expect(props.userStartedTyping).toHaveBeenCalledWith('other-user', 'channel1', '', expect.any(Number));
        });

        it('should dispatch typing with rootId when thread channel differs from current channel', () => {
            const props = {...baseProps, channelId: 'channel1', rhsSelectedPostId: 'thread1'};
            shallow(<MsgTyping {...props}/>);

            wsHandler!(typingMsg('channel2', 'thread1', 'other-user'));

            expect(props.userStartedTyping).toHaveBeenCalledWith('other-user', 'channel2', 'thread1', expect.any(Number));
        });

        it('should dispatch recording with rootId when thread channel differs from current channel', () => {
            const props = {...baseProps, channelId: 'channel1', rhsSelectedPostId: 'thread1'};
            shallow(<MsgTyping {...props}/>);

            wsHandler!(recordingMsg('channel2', 'thread1', 'other-user'));

            expect(props.userStartedRecording).toHaveBeenCalledWith('other-user', 'channel2', 'thread1', expect.any(Number));
        });
    });
});
