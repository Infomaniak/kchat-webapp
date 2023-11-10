// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {Emoji} from '@mattermost/types/emojis';

import type {GenericAction} from 'mattermost-redux/types/actions';

import {addReaction} from 'actions/post_actions';
import {getEmojiMap} from 'selectors/emojis';
import {getCurrentLocale} from 'selectors/i18n';

import type {GlobalState} from 'types/store';

import PostReaction from './post_recent_reactions';

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            addReaction,
        }, dispatch),
    };
}

function mapStateToProps(state: GlobalState) {
    const locale = getCurrentLocale(state);
    const emojiMap = getEmojiMap(state);
    const defaultEmojis = [emojiMap.get('thumbsup'), emojiMap.get('grinning'), emojiMap.get('white_check_mark')] as Emoji[];

    return {
        defaultEmojis,
        locale,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostReaction);
