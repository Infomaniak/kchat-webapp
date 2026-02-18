// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import IKAppBranding from './ik_app_branding';

jest.mock('utils/user_agent', () => ({
    isDesktopApp: jest.fn(() => false),
}));

describe('components/IKAppBranding', () => {
    test('should render web component on web', () => {
        const wrapper = shallow(<IKAppBranding/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should render logo on desktop app', () => {
        const {isDesktopApp} = require('utils/user_agent');
        isDesktopApp.mockReturnValue(true);

        const wrapper = shallow(<IKAppBranding/>);
        expect(wrapper).toMatchSnapshot();
    });
});
