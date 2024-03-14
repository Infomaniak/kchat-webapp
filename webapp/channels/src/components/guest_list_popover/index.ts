// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch, ActionCreatorsMapObject} from 'redux';
import {bindActionCreators} from 'redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import type {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';
import {setPopoverSearchTerm} from 'actions/views/search';
import {getIsMobileView} from 'selectors/views/browser';

import type {ModalData} from 'types/actions';
import type {GlobalState} from 'types/store';

import GuestListPopover from './guest_list_popover';

type Actions = {
    setPopoverSearchTerm: (term: string) => void;
    openModal: <P>(modalData: ModalData<P>) => void;
};

type OwnProps = {
    channelId: string;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        channel: getChannel(state, ownProps.channelId),
        isMobileView: getIsMobileView(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            setPopoverSearchTerm,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GuestListPopover);
