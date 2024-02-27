// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {stripMarkdown} from 'utils/markdown';

import './attachment_card.scss';

type Props = {
    fallback: string;
    pretext: string;
    title: string;
    text: string;
    author_name: string;
}

function AttachmentCard({
    fallback,
    title,
    text,
    author_name: authorName,
    pretext,
}: Props) {
    return (
        <div>
            {(authorName || title) && (
                <div className='attachment__truncated'>
                    {authorName} {authorName && title ? ':' : ''} {title}
                </div>
            )}
            <div className='attachment__truncated'>
                {stripMarkdown(text || pretext || fallback)}
            </div>
        </div>
    );
}

export default AttachmentCard;
