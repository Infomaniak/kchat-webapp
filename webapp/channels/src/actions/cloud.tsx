// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Stripe} from '@stripe/stripe-js';
import {lazy} from 'react';

import type {ChannelType} from '@mattermost/types/channels';
import type {Address, Feedback, WorkspaceDeletionRequest} from '@mattermost/types/cloud';
import type {ServerError} from '@mattermost/types/errors';

import {CloudTypes} from 'mattermost-redux/action_types';
import {getCloudCustomer, getCloudProducts, getCloudSubscription, getInvoices} from 'mattermost-redux/actions/cloud';
import {Client4} from 'mattermost-redux/client';
import {General} from 'mattermost-redux/constants';
import {getCloudErrors} from 'mattermost-redux/selectors/entities/cloud';
import type {ActionFunc, ThunkActionFunc} from 'mattermost-redux/types/actions';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import {isModalOpen} from 'selectors/views/modals';

import {withSuspense} from 'components/common/hocs/with_suspense';
import {getConfirmCardSetup} from 'components/payment_form/stripe';

import {ModalIdentifiers} from 'utils/constants';
import {isLimitExceeded} from 'utils/limits';
import {getBlankAddressWithCountry} from 'utils/utils';

import type {StripeSetupIntent, BillingDetails} from 'types/cloud/sku';
import type {GlobalState} from 'types/store';

import {closeModal, openModal} from './views/modals';

const ChannelLimitReachedModal = withSuspense(lazy(() => import('components/limits/channel_limit_reached_modal')));
const ExternalLimitReachedModal = withSuspense(lazy(() => import('components/limits/external_limit_reached_modal')));

// Returns true for success, and false for any error
export function completeStripeAddPaymentMethod(
    stripe: Stripe,
    billingDetails: BillingDetails,
    cwsMockMode: boolean,
) {
    return async () => {
        let paymentSetupIntent: StripeSetupIntent;
        try {
            paymentSetupIntent = await Client4.createPaymentMethod() as StripeSetupIntent;
        } catch (error) {
            return error;
        }
        const cardSetupFunction = getConfirmCardSetup(cwsMockMode);
        const confirmCardSetup = cardSetupFunction(stripe.confirmCardSetup);

        const result = await confirmCardSetup(
            paymentSetupIntent.client_secret,
            {
                payment_method: {
                    card: billingDetails.card,
                    billing_details: {
                        name: billingDetails.name,
                        address: {
                            line1: billingDetails.address,
                            line2: billingDetails.address2,
                            city: billingDetails.city,
                            state: billingDetails.state,
                            country: billingDetails.country,
                            postal_code: billingDetails.postalCode,
                        },
                    },
                },
            },
        );

        if (!result) {
            return false;
        }

        const {setupIntent, error: stripeError} = result;

        if (stripeError) {
            return false;
        }

        if (setupIntent == null) {
            return false;
        }

        if (setupIntent.status !== 'succeeded') {
            return false;
        }

        try {
            await Client4.confirmPaymentMethod(setupIntent.id);
        } catch (error) {
            return false;
        }

        return true;
    };
}

export function getInstallation() {
    return async () => {
        try {
            const installation = await Client4.getInstallation();
            return {data: installation};
        } catch (e: any) {
            return {error: e.message};
        }
    };
}

export function subscribeCloudSubscription(
    productId: string,
    shippingAddress: Address = getBlankAddressWithCountry(),
    seats = 0,
    downgradeFeedback?: Feedback,
) {
    return async () => {
        try {
            const subscription = await Client4.subscribeCloudProduct(
                productId,
                shippingAddress,
                seats,
                downgradeFeedback,
            );

            return {data: subscription};
        } catch (e: any) {
            // In the event that the status code returned is 422, this request has been blocked by export compliance
            return {data: false, error: {error: e.message, status: e.status_code}};
        }
    };
}

export function getUsage(): ThunkActionFunc<Promise<any>> {
    return async (dispatch) => {
        try {
            const result = await Client4.getUsage();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_USAGE,
                    data: result,
                });
            }
        } catch (e) {
            return e;
        }
        return {data: true};
    };
}

export function openChannelLimitModalIfNeeded(error: ServerError, type: ChannelType): ThunkActionFunc<{data: boolean}> {
    return (dispatch, getState) => {
        if (isLimitExceeded(error)) {
            if (isModalOpen(getState(), ModalIdentifiers.NEW_CHANNEL_MODAL)) {
                dispatch(closeModal(ModalIdentifiers.NEW_CHANNEL_MODAL));
            } else if (isModalOpen(getState(), ModalIdentifiers.UNARCHIVE_CHANNEL)) {
                dispatch(closeModal(ModalIdentifiers.UNARCHIVE_CHANNEL));
            }
            dispatch(openModal({
                modalId: ModalIdentifiers.CHANNEL_LIMIT_REACHED,
                dialogType: ChannelLimitReachedModal,
                dialogProps: {
                    isPublicLimited: type === General.OPEN_CHANNEL,
                    isPrivateLimited: type === General.PRIVATE_CHANNEL,
                },
            }));
        }
        return {data: true};
    };
}

export function requestCloudTrial(page: string, subscriptionId: string, email = ''): ThunkActionFunc<Promise<boolean>> {
    trackEvent('api', 'api_request_cloud_trial_license', {from_page: page});
    return async (dispatch) => {
        try {
            const newSubscription = await Client4.requestCloudTrial(subscriptionId, email);
            dispatch({
                type: CloudTypes.RECEIVED_CLOUD_SUBSCRIPTION,
                data: newSubscription.data,
            });
        } catch (error) {
            return false;
        }
        return true;
    };
}

export function validateBusinessEmail(email = '') {
    trackEvent('api', 'api_validate_business_email');
    return async () => {
        try {
            const res = await Client4.validateBusinessEmail(email);
            return res.data.is_valid;
        } catch (error) {
            return false;
        }
    };
}

export function validateWorkspaceBusinessEmail() {
    trackEvent('api', 'api_validate_workspace_business_email');
    return async () => {
        try {
            const res = await Client4.validateWorkspaceBusinessEmail();
            return res.data.is_valid;
        } catch (error) {
            return false;
        }
    };
}

export function getCloudLimits(): ThunkActionFunc<Promise<boolean | ServerError>> {
    return async (dispatch) => {
        try {
            dispatch({
                type: CloudTypes.CLOUD_LIMITS_REQUEST,
            });
            const result = await Client4.getCloudLimits();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_CLOUD_LIMITS,
                    data: result,
                });
            }
        } catch (error) {
            dispatch({
                type: CloudTypes.CLOUD_LIMITS_FAILED,
            });
            return error;
        }
        return true;
    };
}

export function getMessagesUsage(): ThunkActionFunc<Promise<boolean | ServerError>> {
    return async (dispatch) => {
        try {
            const result = await Client4.getPostsUsage();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_MESSAGES_USAGE,
                    data: result.count,
                });
            }
        } catch (error) {
            return error;
        }
        return true;
    };
}

export function getFilesUsage(): ThunkActionFunc<Promise<boolean | ServerError>> {
    return async (dispatch) => {
        try {
            const result = await Client4.getFilesUsage();

            if (result) {
                // match limit notation in bits
                const inBits = result.bytes * 8;
                dispatch({
                    type: CloudTypes.RECEIVED_FILES_USAGE,
                    data: inBits,
                });
            }
        } catch (error) {
            return error;
        }
        return {data: true};
    };
}

export function getTeamsUsage(): ThunkActionFunc<Promise<boolean | ServerError>> {
    return async (dispatch) => {
        try {
            const result = await Client4.getTeamsUsage();
            if (result) {
                dispatch({
                    type: CloudTypes.RECEIVED_TEAMS_USAGE,
                    data: {active: result.active, cloudArchived: result.cloud_archived},
                });
            }
        } catch (error) {
            return error;
        }
        return {data: false};
    };
}

export function deleteWorkspace(deletionRequest: WorkspaceDeletionRequest) {
    return async () => {
        try {
            await Client4.deleteWorkspace(deletionRequest);
        } catch (error) {
            return error;
        }
        return true;
    };
}

export function retryFailedCloudFetches(): ActionFunc<boolean, GlobalState> {
    return (dispatch, getState) => {
        const errors = getCloudErrors(getState());
        if (Object.keys(errors).length === 0) {
            return {data: true};
        }

        if (errors.subscription) {
            dispatch(getCloudSubscription());
        }

        if (errors.products) {
            dispatch(getCloudProducts());
        }

        if (errors.customer) {
            dispatch(getCloudCustomer());
        }

        if (errors.invoices) {
            dispatch(getInvoices());
        }

        if (errors.limits) {
            dispatch(getCloudLimits());
        }

        return {data: true};
    };
}

export function openExternalLimitModalIfNeeded(error: ServerError): ActionFunc<boolean, GlobalState> {
    return (dispatch, getState) => {
        if (isLimitExceeded(error)) {
            if (isModalOpen(getState(), ModalIdentifiers.INVITATION)) {
                dispatch(closeModal(ModalIdentifiers.INVITATION));
            }
            dispatch(openModal({
                modalId: ModalIdentifiers.EXTERNAL_LIMIT_REACHED,
                dialogType: ExternalLimitReachedModal,
            }));
        }
        return {data: true};
    };
}
