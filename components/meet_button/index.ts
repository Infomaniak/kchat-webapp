// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel, getMyCurrentChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import {getCurrentLocale} from 'selectors/i18n';
import {GlobalState} from 'types/store/index';

import MeetButton from './meet_button';

function mapStateToProps(state: GlobalState) {
    return {
        currentChannel: getCurrentChannel(state),
        locale: getCurrentLocale(state),
        channelMember: getMyCurrentChannelMembership(state),
    };
}

export default connect(mapStateToProps)(MeetButton);
