// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {Provider} from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import mockStore from 'tests/test_store';

import InteractiveDialog from './interactive_dialog.jsx';

describe('components/interactive_dialog/InteractiveDialog', () => {
    it('fake test temporary', () => {
        expect(true).toEqual(true);
    });

    describe('default select element in Interactive Dialog', () => {
        test('should be enabled by default', () => {
            const selectElement = {
                data_source: '',
                default: 'opt3',
                display_name: 'Option Selector',
                name: 'someoptionselector',
                optional: false,
                options: [
                    {text: 'Option1', value: 'opt1'},
                    {text: 'Option2', value: 'opt2'},
                    {text: 'Option3', value: 'opt3'},
                ],
                type: 'select',
            };

            const {elements, ...rest} = baseProps;
            elements.push(selectElement);
            const props = {
                ...rest,
                elements,
            };

            const store = mockStore({});
            const wrapper = mountWithIntl(
                <Provider store={store}>
                    <InteractiveDialog {...props}/>
                </Provider>,
            );
            expect(wrapper.find(Modal.Body).find('input').find({defaultValue: 'Option3'}).exists()).toBe(true);
        });
    });

    describe('bool element in Interactive Dialog', () => {
        const element = {
            data_source: '',
            display_name: 'Boolean Selector',
            name: 'somebool',
            optional: false,
            type: 'bool',
            placeholder: 'Subscribe?',
        };
        const {elements, ...rest} = baseProps;
        const props = {
            ...rest,
            elements: [
                ...elements,
                element,
            ],
        };

        const testCases = [
            {description: 'no default', expectedChecked: false},
            {description: 'unknown default', default: 'unknown', expectedChecked: false},
            {description: 'default of "false"', default: 'false', expectedChecked: false},
            {description: 'default of true', default: true, expectedChecked: true},
            {description: 'default of "true"', default: 'True', expectedChecked: true},
            {description: 'default of "True"', default: 'True', expectedChecked: true},
            {description: 'default of "TRUE"', default: 'TRUE', expectedChecked: true},
        ];

        testCases.forEach((testCase) => test(`should interpret ${testCase.description}`, () => {
            if (testCase.default === undefined) {
                delete element.default;
            } else {
                element.default = testCase.default;
            }

            const store = mockStore({});
            const wrapper = mountWithIntl(
                <Provider store={store}>
                    <InteractiveDialog {...props}/>
                </Provider>,
            );
            expect(wrapper.find(Modal.Body).find('input').find({checked: testCase.expectedChecked}).exists()).toBe(true);
        }));
    });
});
