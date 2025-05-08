import React from "react"




import "./mail_attachment.scss"
import {MailInfo, Post, PostType} from "@mattermost/types/posts";
import MessageWithAdditionalContent from "../message_with_additional_content";
import PostMessageView from "../post_view/post_message_view";
import PostMarkdown from "../post_markdown";
import Markdown from "../markdown";

export const MailAttachmentMessage = (props: {post: Post}) => {
    // const {
    //     mailSubject,
    //     mailDate,
    //     senderName,
    //     targetName,
    // } = props;

    const post = props.post;
    const {
        senderName = 'Charbel',
        targetName = 'Shai',
        subject = 'Promotion de Shai',
        dateLabel = 'Demain',
    } = post.props as MailInfo;
    return(
        <>
            <div className="mail_attachment">
                <div className="mail_attachment__row">
                    {/* TODO ICON */}
                    <div className="bold">{('À propos de l’e-mail')}</div>
                    <div className="thin right">{dateLabel}</div>
                </div>
                <div className="mail_attachment__row">
                    <div className="thin">{('Expéditeur')}:</div>
                    <div className="border-right">{senderName}</div>
                    <div className="thin">{('Destinataire')}:</div>
                    <div>{targetName}</div>
                </div>
                <div className="mail_attachment__row">
                    <div className="thin">{('Objet')}:</div>
                    <div>{subject}</div>
                </div>
            </div>
            <Markdown
                // imageProps={post.imageProps}
                message={post.message}
                // proxyImages={post.ima}
                // mentionKeys={}
                // highlightKeys={highlightKeys}
                // options={options}
                // channelNamesMap={channelNamesMap}
                // hasPluginTooltips={this.props.hasPluginTooltips}
                // imagesMetadata={this.props.post?.metadata?.images}
                postId={post.id}
                editedAt={post.edit_at ? post.edit_at : undefined}
            />
        </>
    );
}
