// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This is a temporary store while we are transitioning from Flux to Redux. This file exports
// the configured Redux store for use by actions and selectors.

import * as Sentry from '@sentry/react';
import type {StoreEnhancer} from 'redux';

import configureStore from 'store';

import {transformStateForSentry} from 'utils/sentry';

const sentryReduxEnhancer: StoreEnhancer = Sentry.createReduxEnhancer({
    stateTransformer: transformStateForSentry,
});

const store = configureStore(
    undefined,
    undefined,
    [sentryReduxEnhancer],
);

// Export the store to simplify debugging in production environments. This is not a supported API,
// and should not be relied upon by plugins.
(window as any).store = store;

export default store;
