// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {Post} from '@mattermost/types/posts';

import {makeCreateAriaLabelForPost} from 'utils/post_utils';

import type {GlobalState} from 'types/store';

export type Props = React.HTMLProps<HTMLDivElement> & {
    labelPrefix?: string;
    post: Post;
}

const PostAriaLabelDiv = React.forwardRef((props: Props, ref: React.Ref<HTMLDivElement>) => {
    const {
        children,
        labelPrefix,
        post,
        ...otherProps
    } = props;

    const intl = useIntl();

    const createAriaLabelForPost = useRef(makeCreateAriaLabelForPost());
    let ariaLabel = useSelector<GlobalState, string>((state) => createAriaLabelForPost.current(state, post)(intl));
    if (labelPrefix) {
        ariaLabel = labelPrefix + ariaLabel;
    }

    return (
        <div
            ref={ref}
            aria-label={ariaLabel}
            {...otherProps}
        >
            {children}
        </div>
    );
});

PostAriaLabelDiv.displayName = 'PostAriaLabelDiv';

export default PostAriaLabelDiv;
