import * as Sentry from '@sentry/react';
import React, {memo, useCallback, useEffect} from 'react';

import type {ChannelType} from '@mattermost/types/channels';
import type {MessageAttachment} from '@mattermost/types/message_attachments';
import type {PostPreviewMetadata} from '@mattermost/types/posts';

import type {ActionResult} from 'mattermost-redux/types/actions';

import Markdown from 'components/markdown';
import ActionButton from 'components/post_view/message_attachments/action_button';
import PostMessagePreview from 'components/post_view/post_message_preview';

const extractPermalinkPostId = (text?: string) => text?.match(/\/pl\/([a-z0-9-]+)/i)?.[1];

type Props = {
    attachments: MessageAttachment[];
    postId: string;
    channelId: string;
    handleFileDropdownOpened?: (open: boolean) => void;
    doPostActionWithCookie?: (postId: string, actionId: string, actionCookie: string, selectedOption?: string) => Promise<ActionResult>;
    getPost?: (postId: string) => Promise<ActionResult>;
};

const ReminderList = ({
    attachments,
    postId,
    channelId,
    handleFileDropdownOpened,
    doPostActionWithCookie,
    getPost,
}: Props) => {
    useEffect(() => {
        if (!getPost) {
            return;
        }
        attachments.forEach((attachment) => {
            const permalinkPostId = extractPermalinkPostId(attachment.text);
            if (permalinkPostId) {
                getPost(permalinkPostId).catch((error) => {
                    Sentry.captureException(error);
                });
            }
        });
    }, [attachments, getPost]);

    const handleReminderAction = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const actionId = e.currentTarget.getAttribute('data-action-id') || '';
        const actionCookie = e.currentTarget.getAttribute('data-action-cookie') || '';
        if (doPostActionWithCookie) {
            doPostActionWithCookie(postId, actionId, actionCookie);
        }
    }, [postId, doPostActionWithCookie]);

    return (
        <div>
            {attachments.map((attachment, index) => {
                const permalinkPostId = extractPermalinkPostId(attachment.text);

                // Dummy data required for PostMessagePreview type compliance; forwarding/preview actions will not work from ephemeral reminders
                const metadata: PostPreviewMetadata | null = permalinkPostId ? {
                    post_id: permalinkPostId,
                    channel_display_name: '',
                    team_name: '',
                    channel_type: 'O' as ChannelType,
                    channel_id: channelId,
                } : null;

                return (
                    <div
                        key={`reminder-${index}`}
                    >
                        <div className={'attachment'}>
                            <div className={'attachment__content'}>
                                <div className={'clearfix attachment__container'}>
                                    <div className={'attachment__body'}>
                                        {attachment.text && (
                                            <div className={'attachment__text'}>
                                                <Markdown
                                                    message={attachment.text}
                                                    postId={postId}
                                                />
                                            </div>
                                        )}
                                        {metadata && (
                                            <PostMessagePreview
                                                metadata={metadata}
                                                handleFileDropdownOpened={handleFileDropdownOpened}
                                            />
                                        )}
                                        {attachment.actions && attachment.actions.length > 0 && (
                                            <div className={'attachment-actions'}>
                                                {attachment.actions.map((action) => (
                                                    action.type === 'button' ? (
                                                        <ActionButton
                                                            key={action.id}
                                                            action={action}
                                                            handleAction={handleReminderAction}
                                                            actionExecuting={false}
                                                            actionExecutingMessage={''}
                                                        />
                                                    ) : null
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default memo(ReminderList);
