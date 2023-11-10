// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getCloudSubscription} from 'mattermost-redux/actions/cloud';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {closeModal, openModal} from 'actions/views/modals';

import {ModalIdentifiers, Preferences} from 'utils/constants';

import type {GlobalState} from 'types/store';

import DeliquencyModalController from './delinquency_modal_controller';

function makeMapStateToProps() {
    const getCategory = makeGetCategory();

    return function mapStateToProps(state: GlobalState) {
        const license = getLicense(state);
        const isCloud = license.Cloud === 'true';
        const subscription = state.entities.cloud?.subscription;
        const userIsAdmin = isCurrentUserSystemAdmin(state);

        return {
            isCloud,
            subscription,
            userIsAdmin,
            delinquencyModalPreferencesConfirmed: getCategory(state, Preferences.DELINQUENCY_MODAL_CONFIRMED),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getCloudSubscription,
            closeModal: () => closeModal(ModalIdentifiers.DELINQUENCY_MODAL_DOWNGRADE),
            openModal,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(DeliquencyModalController);
