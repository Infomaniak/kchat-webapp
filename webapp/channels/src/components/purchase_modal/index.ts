// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {getCloudProducts, getCloudSubscription, getInvoices} from 'mattermost-redux/actions/cloud';
import {getClientConfig} from 'mattermost-redux/actions/general';
import {getAdminAnalytics, getConfig} from 'mattermost-redux/selectors/entities/admin';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {completeStripeAddPaymentMethod, subscribeCloudSubscription} from 'actions/cloud';
import {closeModal, openModal} from 'actions/views/modals';
import {getCloudDelinquentInvoices, isCloudDelinquencyGreaterThan90Days, isCwsMockMode} from 'selectors/cloud';
import {isModalOpen} from 'selectors/views/modals';

import {makeAsyncComponent} from 'components/async_load';
import withGetCloudSubscription from 'components/common/hocs/cloud/with_get_cloud_subscription';
import {getStripePublicKey} from 'components/payment_form/stripe';

import {daysToExpiration} from 'utils/cloud_utils';
import {ModalIdentifiers} from 'utils/constants';
import {getCloudContactSalesLink, getCloudSupportLink} from 'utils/contact_support_sales';
import {findOnlyYearlyProducts} from 'utils/products';

import type {GlobalState} from 'types/store';

const PurchaseModal = makeAsyncComponent('PurchaseModal', React.lazy(() => import('./purchase_modal')));

function mapStateToProps(state: GlobalState) {
    const subscription = state.entities.cloud.subscription;

    const isDelinquencyModal = Boolean(state.entities.cloud.subscription?.delinquent_since);
    const isRenewalModal = daysToExpiration(state.entities.cloud.subscription) <= 60 && state.entities.cloud.subscription?.is_free_trial === 'false' && !isDelinquencyModal && getConfig(state).FeatureFlags?.CloudAnnualRenewals;
    const products = state.entities.cloud!.products;
    const yearlyProducts = findOnlyYearlyProducts(products || {});

    const customer = state.entities.cloud.customer;
    const customerEmail = customer?.email || '';
    const firstName = customer?.contact_first_name || '';
    const lastName = customer?.contact_last_name || '';
    const companyName = customer?.name || '';
    const contactSalesLink = getCloudContactSalesLink(firstName, lastName, companyName, customerEmail, 'mattermost', 'in-product-cloud');
    const contactSupportLink = getCloudSupportLink(customerEmail, 'Cloud purchase', '', window.location.host);
    const stripePublicKey = getStripePublicKey(state);

    return {
        show: isModalOpen(state, ModalIdentifiers.CLOUD_PURCHASE),
        products,
        yearlyProducts,
        cwsMockMode: isCwsMockMode(state),
        contactSupportLink,
        invoices: getCloudDelinquentInvoices(state),
        isCloudDelinquencyGreaterThan90Days: isCloudDelinquencyGreaterThan90Days(state),
        isFreeTrial: subscription?.is_free_trial === 'true',
        isComplianceBlocked: subscription?.compliance_blocked === 'true',
        contactSalesLink,
        productId: subscription?.product_id,
        customer,
        currentTeam: getCurrentTeam(state),
        theme: getTheme(state),
        isDelinquencyModal,
        isRenewalModal,
        usersCount: Number(getAdminAnalytics(state)!.TOTAL_USERS) || 1,
        stripePublicKey,
        subscription,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators(
            {
                closeModal: () => closeModal(ModalIdentifiers.CLOUD_PURCHASE),
                openModal,
                getCloudProducts,
                completeStripeAddPaymentMethod,
                subscribeCloudSubscription,
                getClientConfig,
                getInvoices,
                getCloudSubscription,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withGetCloudSubscription(PurchaseModal));
