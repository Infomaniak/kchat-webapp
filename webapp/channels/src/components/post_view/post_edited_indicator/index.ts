// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {Post} from '@mattermost/types/posts';

import {getPostEditHistory} from 'mattermost-redux/actions/posts';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {makeGetUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';

import {openShowEditHistory} from 'actions/views/rhs';

import {Preferences} from 'utils/constants';
import {isPostOwner, canEditPost} from 'utils/post_utils';

import PostEditedIndicator from './post_edited_indicator';

import {areTimezonesEnabledAndSupported} from '../../../selectors/general';
import type {GlobalState} from '../../../types/store';
import type {Props as TimestampProps} from '../../timestamp/timestamp';

type OwnProps = {
    postId?: string;
    editedAt?: number;
}

type StateProps = {
    postOwner?: boolean;
    isMilitaryTime: boolean;
    timeZone?: string;
    post?: Post;
    canEdit: boolean;
}

type DispatchProps = {
    actions: {
        openShowEditHistory: (post: Post) => void;
        getPostEditHistory: (postId: string) => void;
    };
}

export type Props = OwnProps & StateProps & DispatchProps;

function makeMapStateToProps() {
    const getUserTimezone = makeGetUserTimezone();

    return (state: GlobalState, ownProps: OwnProps): StateProps => {
        const currentUserId = getCurrentUserId(state);
        const post = ownProps.postId ? getPost(state, ownProps.postId) : undefined;
        const license = getLicense(state);
        const config = getConfig(state);
        const channel = getChannel(state, post?.channel_id || '');

        let timeZone: TimestampProps['timeZone'];

        if (areTimezonesEnabledAndSupported(state)) {
            timeZone = getUserCurrentTimezone(getUserTimezone(state, currentUserId)) ?? undefined;
        }
        const postOwner = post ? isPostOwner(state, post) : undefined;

        const isMilitaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false);
        const canEdit = post ? canEditPost(state, post, license, config, channel, currentUserId) : false;
        return {isMilitaryTime, timeZone, postOwner, post, canEdit};
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            openShowEditHistory,
            getPostEditHistory,
        }, dispatch),
    };
}

export default connect<StateProps, DispatchProps, OwnProps, GlobalState>(makeMapStateToProps, mapDispatchToProps)(PostEditedIndicator);
