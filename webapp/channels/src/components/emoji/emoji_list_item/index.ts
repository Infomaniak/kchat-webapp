// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {deleteCustomEmoji} from 'mattermost-redux/actions/emojis';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {getDisplayNameByUser} from 'utils/utils';

import type {Props} from './emoji_list_item';
import EmojiListItem from './emoji_list_item';

import type {GlobalState} from '../../../types/store';

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const emoji = state.entities.emojis.customEmoji[ownProps.emojiId!];
    const creator = getUser(state, emoji.creator_id);

    return {
        emoji,
        creatorDisplayName: getDisplayNameByUser(state, creator),
        creatorUsername: creator ? creator.username : '',
        currentUserId: getCurrentUserId(state),
        currentTeam: getCurrentTeam(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            deleteCustomEmoji,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiListItem);
