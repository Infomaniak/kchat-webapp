// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {Channel} from '@mattermost/types/channels';

import {viewChannel} from 'mattermost-redux/actions/channels';
import {autoUpdateTimezone} from 'mattermost-redux/actions/timezone';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import type {DispatchFunc, GenericAction} from 'mattermost-redux/types/actions';

import {getHistory} from 'utils/browser_history';
import {isPermalinkURL} from 'utils/url';
import {getChannelURL} from 'utils/utils';

import type {GlobalState} from 'types/store';

import LoggedIn from './logged_in';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        currentUser: getCurrentUser(state),
        currentChannelId: getCurrentChannelId(state),
        enableTimezone: config.ExperimentalTimezone === 'true',
    };
}

// NOTE: suggestions where to keep this welcomed
const getChannelURLAction = (channel: Channel, teamId: string, url: string) => (dispatch: DispatchFunc, getState: () => GlobalState) => {
    const state = getState();

    if (url && isPermalinkURL(url)) {
        return getHistory().push(url);
    }

    return getHistory().push(getChannelURL(state, channel, teamId));
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            autoUpdateTimezone,
            getChannelURLAction,
            viewChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoggedIn);
