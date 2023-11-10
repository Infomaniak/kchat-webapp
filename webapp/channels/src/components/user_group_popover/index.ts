// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch, ActionCreatorsMapObject} from 'redux';
import {bindActionCreators} from 'redux';

import {searchProfiles} from 'mattermost-redux/actions/users';
import type {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';
import {setPopoverSearchTerm} from 'actions/views/search';
import {getIsMobileView} from 'selectors/views/browser';

import type {ModalData} from 'types/actions';
import type {GlobalState} from 'types/store';

import UserGroupPopover from './user_group_popover';

type Actions = {
    setPopoverSearchTerm: (term: string) => void;
    openModal: <P>(modalData: ModalData<P>) => void;
    searchProfiles: (term: string, options: any) => Promise<ActionResult>;
};

function mapStateToProps(state: GlobalState) {
    return {
        searchTerm: state.views.search.popoverSearch,
        isMobileView: getIsMobileView(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            setPopoverSearchTerm,
            openModal,
            searchProfiles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupPopover);
