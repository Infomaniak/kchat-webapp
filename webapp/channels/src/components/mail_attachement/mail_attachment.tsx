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
        created_at,
    } = post.props.mail_attachment as {from: string; to: string; subject: string;created_at: number};

    return (
        <>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <wc-mail-attachment
                class='mail_attachment'
                mail-subject={subject}
                mail-date={created_at}
                sender-name={from}
                target-name={to}
            >
                <Timestamp value={created_at * 1000}/>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
            </wc-mail-attachment>
            <Markdown
                message={post.message}
                postId={post.id}
                editedAt={post.edit_at ? post.edit_at : undefined}
            />
        </>
    );
};
