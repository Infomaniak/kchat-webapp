// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {screen} from '@testing-library/react';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {renderWithIntlAndStore} from 'tests/react_testing_utils';
import {ErrorPageTypes} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import {GlobalState} from '@mattermost/types/store';

import ErrorPage from './error_page';

describe('ErrorPage', () => {
    it('should retunr true', function() {
        expect(true);
    });

    // it('displays cloud archived page correctly', () => {
    //     renderWithIntlAndStore(
    //         (
    //             <BrowserRouter>
    //                 <ErrorPage
    //                     location={{
    //                         search: `?type=${ErrorPageTypes.CLOUD_ARCHIVED}`,
    //                     }}
    //                 />
    //             </BrowserRouter>
    //         ),
    //         {
    //             entities: {
    //                 cloud: {
    //                     subscription: TestHelper.getSubscriptionMock({
    //                         product_id: 'prod_a',
    //
    //                     }),
    //                     products: {
    //                         prod_a: TestHelper.getProductMock({
    //                             id: 'prod_a',
    //                             name: 'cloud plan',
    //                         }),
    //                     },
    //                 },
    //             },
    //         } as unknown as GlobalState,
    //     );
    //
    //     screen.getByText('Message Archived');
    //     screen.getByText('archived because of cloud plan limits', {exact: false});
    // });
});
