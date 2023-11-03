// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import UserGuideDropdown from './user_guide_dropdown';

jest.mock('actions/telemetry_actions.jsx', () => {
    const original = jest.requireActual('actions/telemetry_actions.jsx');

    return {
        ...original,
        trackEvent: jest.fn(),
    };
});

describe('UserGuideDropdown', () => {
    const baseProps = {
        helpLink: 'helpLink',
        reportAProblemLink: 'reportAProblemLink',
        actions: {
            openModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <UserGuideDropdown {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('Should set state buttonActive on toggle of MenuWrapper', () => {
        const wrapper = shallowWithIntl(
            <UserGuideDropdown {...baseProps}/>,
        );

        expect(wrapper.state('buttonActive')).toBe(false);
        wrapper.find(MenuWrapper).prop('onToggle')!(true);
        expect(wrapper.state('buttonActive')).toBe(true);
    });

    test('Should set state buttonActive on toggle of MenuWrapper', () => {
        const wrapper = shallowWithIntl(
            <UserGuideDropdown {...baseProps}/>,
        );

        wrapper.find(Menu.ItemAction).prop('onClick')({preventDefault: jest.fn()});
        expect(baseProps.actions.openModal).toHaveBeenCalled();
    });
});
