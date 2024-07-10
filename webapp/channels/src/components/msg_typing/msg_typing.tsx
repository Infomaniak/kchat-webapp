// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {FormattedMessage} from 'react-intl';

import type {WebSocketMessage} from '@mattermost/client';

import {SocketEvents} from 'utils/constants';
import {useWebSocket} from 'utils/use_websocket';

type Props = {
    channelId: string;
    postId: string;
    typingUsers: string[];
    recordingUsers: string[];
    userStartedTyping: (userId: string, channelId: string, rootId: string, now: number) => void;
    userStoppedTyping: (userId: string, channelId: string, rootId: string, now: number) => void;
    userStoppedRecording: (userId: string, channelId: string, rootId: string, now: number) => void;
    userStartedRecording: (userId: string, channelId: string, rootId: string, now: number) => void;
}

export default function MsgTyping(props: Props) {
    const {userStartedTyping, userStoppedTyping, userStoppedRecording, userStartedRecording} = props;

    useWebSocket({
        handler: useCallback((msg: WebSocketMessage) => {
            if (msg.event === SocketEvents.TYPING || msg.event === SocketEvents.RECORDING) {
                const channelId = msg.data.data.channel_id;
                const rootId = msg.data.data.parent_id;
                const userId = msg.data.data.user_id;
                if (props.channelId === channelId && props.postId === rootId) {
                    msg.event === SocketEvents.TYPING ? userStartedTyping(userId, channelId, rootId, Date.now()) : userStartedRecording(userId, channelId, rootId, Date.now());
                }
            } else if (msg.event === SocketEvents.POSTED) {
                const post = msg.data.post;

                const channelId = post.channel_id;
                const rootId = post.root_id;
                const userId = post.user_id;

                if (props.channelId === channelId && props.postId === rootId) {
                    userStoppedTyping(userId, channelId, rootId, Date.now());
                    userStoppedRecording(userId, channelId, rootId, Date.now());
                }
            }
        }, [props.channelId, props.postId, userStartedTyping, userStartedRecording, userStoppedTyping,
            userStoppedRecording]),
    });

    const getInputText = (users: string[], type: 'typing' | 'recording') => {
        const numUsers = users.length;
        if (numUsers === 0) {
            return '';
        }
        const simpleMessage = type === 'typing' ? 'msg_typing.isTyping' : 'msg_recording.isRecording';
        const multipleMessage = type === 'typing' ? 'msg_typing.areTyping' : 'msg_recording.areRecording';
        if (numUsers === 1) {
            return (
                <FormattedMessage
                    id={simpleMessage}
                    defaultMessage={type === 'typing' ? '{user} is typing...' : '{user} is recording...'}
                    values={{
                        user: users[0],
                    }}
                />
            );
        }
        const last = users.pop();
        return (
            <FormattedMessage
                id={multipleMessage}
                defaultMessage={type === 'typing' ? '{users} and {last} are typing...' : '{users} and {last} are recording...'}
                values={{
                    users: (users.join(', ')),
                    last,
                }}
            />
        );
    };

    const typingText = getInputText([...props.typingUsers], 'typing');
    const recordingText = getInputText([...props.recordingUsers], 'recording');

    return (
        <span className='msg-typing'>{typingText || recordingText}</span>
    );
}
