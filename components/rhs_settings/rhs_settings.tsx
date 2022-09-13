// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
/* eslint-disable react/no-string-refs */

import {Channel} from '@mattermost/types/channels';
import {Post} from '@mattermost/types/posts';

import {FakePost, RhsState} from 'types/store/rhs';

import RhsHeaderPost from 'components/rhs_header_post';
import ThreadViewer from 'components/threading/thread_viewer';

type Props = {
    posts: Post[];
    channel: Channel | null;
    selected: Post | FakePost;
    previousRhsState?: RhsState;
}

const RhsSettings = ({
    previousRhsState,
}: Props) => {


    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            tototototoo
        </div>
    );
};

export default RhsSettings;

