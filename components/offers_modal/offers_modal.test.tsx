// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';

import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import mockStore from 'tests/test_store';

import OffersModal from './offers_modal';

describe('components/offers_modal/offers_modal', () => {
    // required state to mount using the provider
    const state = {
        views: {
            modals: {
                modalState: {
                    offers: {
                        open: 'true',
                    },
                },
            },
        },
    };

    const mockOnExited = jest.fn();

    const props = {
        onExited: mockOnExited,
    };

    const store = mockStore(state);

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <OffersModal {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call the removal method when confirm button is clicked', () => {
        const jsdomOpen = window.open;
        window.open = jest.fn();

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <OffersModal {...props}/>
            </Provider>,
        );
        const confirmButton = wrapper.find('OffersModal').find('button#modify-offer');
        confirmButton.simulate('click');
        expect(mockOnExited).toHaveBeenCalledTimes(1);

        window.open = jsdomOpen;
    });

    test('should close the modal when cancel button is clicked', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <OffersModal {...props}/>
            </Provider>,
        );
        const cancelButton = wrapper.find('OffersModal').find('button#cancel-offer');
        cancelButton.simulate('click');
        expect(mockOnExited).toHaveBeenCalledTimes(1);
    });

    test('should hide the confirm modal', () => {
        const OffersModalHidden = {
            modals: {
                modalState: {},
            },
        };
        const localStore = {...state, views: OffersModalHidden};
        const store = mockStore(localStore);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <OffersModal {...props}/>
            </Provider>,
        );
        expect(wrapper.find('OffersModal').find('div.folders-svg')).toHaveLength(0);
    });
});
