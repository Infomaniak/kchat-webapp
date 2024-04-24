import {connect} from 'react-redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getUserById} from 'mattermost-redux/selectors/entities/users';

import {callParameters} from 'selectors/calls';
import {getCurrentLocale} from 'selectors/i18n';
import {getConferenceByChannelId} from 'selectors/kmeet_calls';

import type {GlobalState} from 'types/store';

import KmeetModal from './kmeet_modal';

type OwnProps = {
    channelId: string;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const user = getCurrentUser(state);
    const locale = getCurrentLocale(state);
    const call = callParameters(state);
    const channel = getChannel(state, ownProps.channelId);
    const conference = getConferenceByChannelId(state, ownProps.channelId);
    const caller = getUserById(state, conference.user_id);
    const users = conference.participants.map((id) => getUserById(state, id));

    return {
        user,
        locale,
        call,
        channel,
        conference,
        users,
        caller,
    };
}

export default connect(mapStateToProps, {})(KmeetModal);
