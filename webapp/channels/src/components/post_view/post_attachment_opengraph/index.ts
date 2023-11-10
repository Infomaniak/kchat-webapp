// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getOpenGraphMetadataForUrl} from 'mattermost-redux/selectors/entities/posts';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {editPost} from 'actions/views/posts';
import {arePreviewsCollapsed} from 'selectors/preferences';

import {Preferences} from 'utils/constants';

import type {GlobalState} from 'types/store';

import type {Props} from './post_attachment_opengraph';
import PostAttachmentOpenGraph from './post_attachment_opengraph';

type OwnProps = Pick<Props, 'postId' | 'link'>;

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const imageCollapsed = arePreviewsCollapsed(state);

    return {
        currentUserId: getCurrentUserId(state),
        enableLinkPreviews: config.EnableLinkPreviews === 'true',
        openGraphData: getOpenGraphMetadataForUrl(
            state,
            ownProps.postId,
            ownProps.link,
        ),
        previewEnabled: getBool(
            state,
            Preferences.CATEGORY_DISPLAY_SETTINGS,
            Preferences.LINK_PREVIEW_DISPLAY,
            true,
        ),
        imageCollapsed,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({editPost}, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostAttachmentOpenGraph);
