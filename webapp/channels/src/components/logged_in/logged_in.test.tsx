// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {UserProfile} from '@mattermost/types/users';

import * as GlobalActions from 'actions/global_actions';
import BrowserStore from 'stores/browser_store';

import type {Props} from 'components/logged_in/logged_in';
import LoggedIn from 'components/logged_in/logged_in';

jest.mock('actions/websocket_actions.jsx', () => ({
    initialize: jest.fn(),
}));

BrowserStore.signalLogin = jest.fn();

describe('components/logged_in/LoggedIn', () => {
    const children = <span>{'Test'}</span>;
    const baseProps: Props = {
        currentUser: {} as UserProfile,
        enableTimezone: false,
        actions: {
            autoUpdateTimezone: jest.fn(),
            getChannelURLAction: jest.fn(),
            viewChannel: jest.fn(),
            registerInternalKdrivePlugin: jest.fn(),
        },
        location: {
            pathname: '/',
            search: '',
        },
    };

    it('should render loading state without user', () => {
        const props = {
            ...baseProps,
            currentUser: undefined,
        };

        const wrapper = shallow(<LoggedIn {...props}>{children}</LoggedIn>);

        expect(wrapper).toMatchInlineSnapshot('<LoadingScreen />');
    });

    it('should signal to other tabs when login is successful', () => {
        const props = {
            ...baseProps,
        };

        shallow(<LoggedIn {...props}>{children}</LoggedIn>);

        expect(BrowserStore.signalLogin).toBeCalledTimes(1);
    });

    it('should set state to unfocused if it starts in the background', () => {
        document.hasFocus = jest.fn(() => false);

        const obj = Object.assign(GlobalActions);
        obj.emitBrowserFocus = jest.fn();

        const props = {
            ...baseProps,
        };

        shallow(<LoggedIn {...props}>{children}</LoggedIn>);
        expect(obj.emitBrowserFocus).toBeCalledTimes(1);
    });
});
