import type {MouseEvent} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import styled, {css, createGlobalStyle} from 'styled-components';

import type {Post} from '@mattermost/types/posts';

import WebSocketClient from 'client/web_websocket_client';

import PostText from './post_text';

const FixPostHover = createGlobalStyle<{disableHover?: string}>`
	${(props) => props.disableHover && css`
	&&&& {
		[data-testid="post-menu-${props.disableHover}"] {
			display: none !important;
		}
		[data-testid="post-menu-${props.disableHover}"]:hover {
			display: none !important;
		}
	}`}
`;

const PostBody = styled.div<{disableHover?: boolean}>`
	${(props) => props.disableHover && css`
	::before {
		content: '';
		position: absolute;
		width: 110%;
		height: 110%;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}`}
`;

type PostUpdateWebsocketMessage = {
    channel_id: string;
    post_id: string;
};

type PostUpdateWebsocketMessageControl = PostUpdateWebsocketMessage & {control: 'start' | 'end'};
type PostUpdateWebsocketMessageNext = PostUpdateWebsocketMessage & {next: string};
type PostUpdateWebsocketMessageAny = PostUpdateWebsocketMessageControl | PostUpdateWebsocketMessageNext;
type PostUpdateWebsocket = {
    event: string;
    data: PostUpdateWebsocketMessageAny;
};

const isPostUpdateWebsocketMessageNext = (msg: any): msg is PostUpdateWebsocketMessageNext =>
    typeof msg.next === 'string';

interface Props {
    post: Post;
}

export const LLMBotPost = (props: Props) => {
    // const selectPost = useSelectNotAIPost();
    const [message, setMessage] = useState(props.post.message as string);

    // Generating is true while we are reciving new content from the websocket
    const [generating, setGenerating] = useState(false);

    // Stopped is a flag that is used to prevent the websocket from updating the message after the user has stopped the generation
    // Needs a ref because of the useEffect closure.
    const [stopped, setStopped] = useState(false);
    const stoppedRef = useRef(stopped);
    stoppedRef.current = stopped;

    // const currentUserId = useSelector<GlobalState, string>((state) => state.entities.users.currentUserId);
    // const rootPost = useSelector<GlobalState, any>((state) => state.entities.posts.posts[props.post.root_id]);
    useEffect(() => {
        function handleCustomMattermostEvent({event, data}: PostUpdateWebsocket) {
            if (event === 'custom_mattermost-ai_postupdate' && data.post_id === props.post.id) {
                if (isPostUpdateWebsocketMessageNext(data)) {
                    if (stoppedRef.current) {
                        return;
                    }
                    setGenerating(true);
                    let message = data.next;
                    const codeBlockRegex = /^```/gm;
                    const matches = message.match(codeBlockRegex);
                    if (matches && matches.length % 2 !== 0) {
                        message += '\n```';
                    }
                    setMessage(message);
                } else if (data.control === 'end') {
                    setGenerating(false);
                    setStopped(false);
                } else if (data.control === 'start') {
                    setGenerating(true);
                    setStopped(false);
                }
            }
        }
        WebSocketClient.addMessageListener(handleCustomMattermostEvent);

        return () => {
            WebSocketClient.removeMessageListener(handleCustomMattermostEvent);
        };
    }, []);

    const stopPropagationIfGenerating = (e: MouseEvent) => {
        if (generating) {
            e.stopPropagation();
        }
    };

    let permalinkView = null;
    const PostMessagePreview = (window as any).Components.PostMessagePreview;
    if (PostMessagePreview) { // Ignore permalink if version does not exporrt PostMessagePreview
        const permalinkData = extractPermalinkData(props.post);
        if (permalinkData !== null) {
            permalinkView = (
                <PostMessagePreview
                    data-testid='llm-bot-permalink'
                    metadata={permalinkData}
                />
            );
        }
    }

    return (
        <PostBody
            data-testid='llm-bot-post'
            disableHover={generating}
            onMouseOver={stopPropagationIfGenerating}
            onMouseEnter={stopPropagationIfGenerating}
            onMouseMove={stopPropagationIfGenerating}
        >
            <FixPostHover disableHover={generating ? props.post.id : ''}/>
            { permalinkView &&
            <>
                {permalinkView}
            </>
            }

            <PostText
                message={message}
                channelID={props.post.channel_id}
                postID={props.post.id}
                showCursor={generating}
            />
        </PostBody>
    );
};

type PermalinkData = {
    channel_display_name: string;
    channel_id: string;
    post_id: string;
    team_name: string;
    post: {
        message: string;
        user_id: string;
    };
}

function extractPermalinkData(post: any): PermalinkData | null {
    for (const embed of post?.metadata?.embeds || []) {
        if (embed.type === 'permalink') {
            return embed.data;
        }
    }
    return null;
}

