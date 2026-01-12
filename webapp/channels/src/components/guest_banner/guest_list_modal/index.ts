// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getChannelGuestProfiles} from 'mattermost-redux/selectors/entities/channels';

import type {GlobalState} from 'types/store';

import GuestListModal from './guest_list_modal';

type OwnProps = {
    channelId: string;
}

function makeMapStateToProps() {
    return function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
        return {
            guestProfiles: getChannelGuestProfiles(state, ownProps.channelId),
        };
    };
}

export default connect(makeMapStateToProps, {})(GuestListModal);
