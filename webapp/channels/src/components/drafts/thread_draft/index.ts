// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetThreadOrSynthetic} from 'mattermost-redux/selectors/entities/threads';

import {PostDraft} from 'types/store/draft';
import {GlobalState} from 'types/store';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getChannelURL} from 'utils/utils';

import ThreadDraft from './thread_draft';

type OwnProps = {
    id: string;
    value: PostDraft;
}

function makeMapStatetoProps() {
    const getThreadOrSynthetic = makeGetThreadOrSynthetic();
    const getChannel = makeGetChannel();
    return (state: GlobalState, ownProps: OwnProps) => {
        const channel = getChannel(state, {id: ownProps.value.channelId});
        const post = getPost(state, ownProps.id);
        const teamId = getCurrentTeamId(state);
        const channelUrl = getChannelURL(state, channel, teamId);

        let thread;
        if (post) {
            thread = getThreadOrSynthetic(state, post);
        }

        return {
            channel,
            thread,
            channelUrl,
        };
    };
}

export default connect(makeMapStatetoProps)(ThreadDraft);
