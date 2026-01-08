// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import type {MessageDescriptor} from 'react-intl';
import {defineMessages, FormattedMessage} from 'react-intl';

import type {WebSocketMessage} from '@mattermost/client';

import {SocketEvents} from 'utils/constants';
import {useWebSocket} from 'utils/use_websocket';

type Props = {
    channelId: string;
    currentUserId: string;
    rootId: string;
    typingUsers: string[];
    recordingUsers: string[];
    userStartedTyping: (userId: string, channelId: string, rootId: string, now: number) => void;
    userStoppedTyping: (userId: string, channelId: string, rootId: string, now: number) => void;
    userStoppedRecording: (userId: string, channelId: string, rootId: string, now: number) => void;
    userStartedRecording: (userId: string, channelId: string, rootId: string, now: number) => void;
}

function extractMessageData(msg: WebSocketMessage) {
    const now = Date.now();

    switch (msg.event) {
    case SocketEvents.TYPING:
    case SocketEvents.RECORDING:
        return {channelId: msg.data.data.channel_id, rootId: msg.data.data.parent_id, userId: msg.data.data.user_id, date: now};
    case SocketEvents.POSTED:
        return {channelId: msg.data.post.channel_id, rootId: msg.data.post.root_id, userId: msg.data.post.user_id, date: now};
    default: return null;
    }
}

type EventType = 'typing' | 'recording'

const msgTypingStrings: Record<string, Record<string, MessageDescriptor>> = {
    typing: defineMessages({
        simple: {
            id: 'msg_typing.isTyping',
            defaultMessage: '{user} is typing...',
        },
        multiple: {
            id: 'msg_typing.areTyping',
            defaultMessage: '{users} and {last} are typing...',
        },
    }),
    recording: defineMessages({
        simple: {
            id: 'msg_recording.isRecording',
            defaultMessage: '{user} is recording...',
        },
        multiple: {
            id: 'msg_recording.areRecording',
            defaultMessage: '{users} and {last} are recording...',
        },
    }),
};

export default function MsgTyping(props: Props) {
    const {userStartedTyping, userStoppedTyping, currentUserId, userStoppedRecording, userStartedRecording} = props;

    useWebSocket({
        handler: useCallback((msg: WebSocketMessage) => {
            const messageData = extractMessageData(msg);
            if (!messageData) {
                return;
            }

            const {channelId, rootId, userId, date} = messageData;

            const isSameUser = userId === currentUserId;
            if (isSameUser) {
                return;
            }

            switch (msg.event) {
            case SocketEvents.TYPING:
                userStartedTyping(userId, channelId, rootId, date);
                break;
            case SocketEvents.RECORDING:
                userStartedRecording(userId, channelId, rootId, date);
                break;
            case SocketEvents.POSTED:
                if (props.channelId === channelId && props.rootId === rootId) {
                    userStoppedTyping(userId, channelId, rootId, Date.now());
                    userStoppedRecording(userId, channelId, rootId, Date.now());
                }
                break;
            default:
                break;
            }
        }, [currentUserId, userStartedTyping, userStartedRecording, props.channelId, props.rootId, userStoppedTyping, userStoppedRecording]),
    });

    const getInputText = (users: string[], eventType: EventType) => {
        const numUsers = users.length;
        if (numUsers === 0) {
            return null;
        }

        const messageKey = numUsers === 1 ? 'simple' : 'multiple';
        const messageDescriptor = msgTypingStrings[eventType][messageKey];

        if (numUsers === 1) {
            return (
                <FormattedMessage
                    {...messageDescriptor}

                    values={{
                        user: users[0],
                    }}
                />
            );
        }
        const last = users.pop();
        return (
            <FormattedMessage
                {...messageDescriptor}
                values={{
                    users: (users.join(', ')),
                    last,
                }}
            />
        );
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
