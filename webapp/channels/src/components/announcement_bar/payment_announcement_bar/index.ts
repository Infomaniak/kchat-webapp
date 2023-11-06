// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getCloudSubscription, getCloudCustomer} from 'mattermost-redux/actions/cloud';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {
    getCloudSubscription as selectCloudSubscription,
    getCloudCustomer as selectCloudCustomer,
    getSubscriptionProduct,
} from 'mattermost-redux/selectors/entities/cloud';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import type {GenericAction} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';

import {CloudProducts} from 'utils/constants';

import type {GlobalState} from 'types/store';

import PaymentAnnouncementBar from './payment_announcement_bar';

function mapStateToProps(state: GlobalState) {
    const subscription = selectCloudSubscription(state);
    const customer = selectCloudCustomer(state);
    const subscriptionProduct = getSubscriptionProduct(state);
    return {
        userIsAdmin: isCurrentUserSystemAdmin(state),
        isCloud: getLicense(state).Cloud === 'true',
        subscription,
        customer,
        isStarterFree: subscriptionProduct?.sku === CloudProducts.STARTER,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                savePreferences,
                openModal,
                getCloudSubscription,
                getCloudCustomer,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentAnnouncementBar);
