import React from "react"




import "./mail_attachment.scss"
import { Post} from "@mattermost/types/posts";

import Markdown from "../markdown";

export const MailAttachmentMessage = (props: {post: Post}) => {

    const post = props.post;
    const {
        from,
        to,
        subject,
        created_at,
    } = post.props;
    console.log({props: post.props});

    return(
        <>
            <div className="mail_attachment">
                <div className="mail_attachment__row">
                    {/* TODO ICON */}
                    <div className="bold">{('À propos de l’e-mail')}</div>
                    <div className="thin right">{created_at}</div>
                </div>
                <div className="mail_attachment__row">
                    <div className="thin">{('Expéditeur')}:</div>
                    <div className="border-right">{from}</div>
                    <div className="thin">{('Destinataire')}:</div>
                    <div>{to}</div>
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
