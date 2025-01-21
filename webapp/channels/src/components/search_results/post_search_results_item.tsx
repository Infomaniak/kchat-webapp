// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Post} from '@mattermost/types/posts';

import PostComponent from 'components/post';
import DateSeparator from 'components/post_view/date_separator';

import {Locations} from 'utils/constants';

import {getDateForUnixTicks} from 'mattermost-webapp/src/utils/utils';

type Props = {
    a11yIndex: number;
    isFlaggedPosts: boolean;
    isMentionSearch: boolean;
    isPinnedPosts: boolean;
    matches: string[];
    post: Post;
    searchTerm: string;
    previousPostDate?: Date | null;
}
export default function PostSearchResultsItem(props: Props) {
    const currentPostDay = getDateForUnixTicks(props.post.create_at);
    const showDateSeparator = !props.previousPostDate || props.previousPostDate.getDate() !== currentPostDay.getDate();

    return (
        <div
            className='search-item__container'
            data-testid='search-item-container'
        >
            {showDateSeparator && <DateSeparator date={currentPostDay}/>}
            <PostComponent
                post={props.post}
                matches={props.matches}
                term={(!props.isFlaggedPosts && !props.isPinnedPosts && !props.isMentionSearch) ? props.searchTerm : ''}
                isMentionSearch={props.isMentionSearch}
                a11yIndex={props.a11yIndex}
                location={Locations.SEARCH}
            />
        </div>
    );
}
