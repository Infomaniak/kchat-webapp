// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {addChannelMember, getChannelMember, autocompleteChannelsForSearch} from 'mattermost-redux/actions/channels';
import {getChannelMembersInChannels} from 'mattermost-redux/selectors/entities/channels';
import type {ActionFunc} from 'mattermost-redux/types/actions';

import type {Props} from './add_user_to_channel_modal';
import AddUserToChannelModal from './add_user_to_channel_modal';

function mapStateToProps(state: GlobalState) {
    const channelMembers = getChannelMembersInChannels(state) || {};
    return {
        channelMembers,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Props['actions']>({
            addChannelMember,
            getChannelMember,
            autocompleteChannelsForSearch,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddUserToChannelModal);
