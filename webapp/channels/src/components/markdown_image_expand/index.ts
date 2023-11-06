// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {GenericAction} from 'mattermost-redux/types/actions';

import {toggleInlineImageVisibility} from 'actions/post_actions';
import {isInlineImageVisible} from 'selectors/posts';

import type {GlobalState} from 'types/store';

import type {Props} from './markdown_image_expand';
import MarkdownImageExpand from './markdown_image_expand';

const mapStateToProps = (state: GlobalState, {postId, imageKey}: Props) => {
    return {
        isExpanded: isInlineImageVisible(state, postId, imageKey),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>) => {
    return {
        actions: bindActionCreators({toggleInlineImageVisibility}, dispatch),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MarkdownImageExpand);
