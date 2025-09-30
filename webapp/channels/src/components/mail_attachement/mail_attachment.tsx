import React from 'react';

import './mail_attachment.scss';
import type {Post} from '@mattermost/types/posts';

import Markdown from '../markdown';
import Timestamp from '../timestamp';

export const MailAttachmentMessage = (props: {post: Post}) => {
    const post = props.post;
    const {
        from,
        to,
        subject,
        created_at: createdAt,
    } = post.props.mail_attachment as {from: string; to: string; subject: string;created_at: number};

    return (
        <>
            <wc-mail-attachment
                class='mail_attachment'
                mail-subject={subject}
                mail-date={createdAt}
                sender-name={from}
                target-name={to}
            >
                <Timestamp value={createdAt * 1000}/>
            </wc-mail-attachment>
            <Markdown
                message={post.message}
                postId={post.id}
                editedAt={post.edit_at ? post.edit_at : undefined}
            />
        </>
    );
};
