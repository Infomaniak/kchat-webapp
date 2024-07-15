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
                switch (msg.event) {
                case SocketEvents.TYPING:
                    userStartedTyping(userId, channelId, rootId, Date.now());
                    break;
                case SocketEvents.RECORDING:
                    userStartedRecording(userId, channelId, rootId, Date.now());
                    break;
                default:
                    throw new Error('no SocketEvents found');
                    break;
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

    const getInputText = (users: string[], type = 'typing') => {
        const numUsers = users.length;
        if (numUsers === 0) {
            return '';
        }
        const {simpleMessage, multipleMessage, defaultSimpleMessage, defaultMultipleMessage} = getMessages(type);

        if (numUsers === 1) {
            return (
                <FormattedMessage
                    id={simpleMessage}
                    defaultMessage={defaultSimpleMessage}
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
                defaultMessage={defaultMultipleMessage}
                values={{
                    users: (users.join(', ')),
                    last,
                }}
            />
        );
    };

    const getMessages = (type = 'typing') => {
        switch (type) {
        case 'typing':
            return {
                simpleMessage: 'msg_typing.isTyping',
                multipleMessage: 'msg_typing.areTyping',
                defaultSimpleMessage: '{user} is typing...',
                defaultMultipleMessage: '{users} and {last} are typing...',
            };
        case 'recording':
            return {
                simpleMessage: 'msg_recording.isRecording',
                multipleMessage: 'msg_recording.areRecording',
                defaultSimpleMessage: '{user} is recording...',
                defaultMultipleMessage: '{users} and {last} are recording...',
            };
        default:
            throw new Error('no messages found');
        }
    };

    const typingText = getInputText([...props.typingUsers], 'typing');
    const recordingText = getInputText([...props.recordingUsers], 'recording');

    if (typingText) {
        return <span className='msg-typing'>{typingText}</span>;
    }
    return (
        <span className='msg-typing'>{recordingText}</span>
    );
}
