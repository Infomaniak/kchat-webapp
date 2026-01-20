// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {UserProfile} from '@mattermost/types/users';

import {Preferences} from 'mattermost-redux/constants';

import BrowserStore from 'stores/browser_store';

import LoggedIn from 'components/logged_in/logged_in';
import type {Props} from 'components/logged_in/logged_in';

import {TestHelper} from 'utils/test_helper';

jest.mock('actions/websocket_actions.jsx', () => ({
    initialize: jest.fn(),
    close: jest.fn(),
}));

BrowserStore.signalLogin = jest.fn();

describe('components/logged_in/LoggedIn - IK custom', () => {
    const originalFetch = global.fetch;
    beforeAll(() => {
        global.fetch = jest.fn();
    });
    afterAll(() => {
        global.fetch = originalFetch;
    });

    const children = <span>{'Test'}</span>;
    const mockTeam = TestHelper.getTeamMock({
        id: '123test',
        name: 'testTeam',
        display_name: 'Test Team',
        delete_at: 0,
    });
    const baseProps: Props = {
        currentUser: {} as UserProfile,
        mfaRequired: false,
        actions: {
            autoUpdateTimezone: jest.fn(),
            getChannelURLAction: jest.fn(),
            updateApproximateViewTime: jest.fn(),
            registerInternalKdrivePlugin: jest.fn(),
            setTheme: jest.fn(),
            updateTeamsOrderForUser: jest.fn(),
            joinCall: jest.fn(),
            cancelCall: jest.fn(),
            declineCall: jest.fn(),
            registerInternalAiPlugin: jest.fn(),
        },
        isCurrentChannelManuallyUnread: false,
        showTermsOfService: false,
        location: {
            pathname: '/',
            search: '',
        },
        theme: Preferences.THEMES.onyx,
    };

    it('should not crash when currentTeam is undefined', () => {
        const props = {
            ...baseProps,
            currentTeam: undefined,
        };

        const wrapper = shallow(<LoggedIn {...props}>{children}</LoggedIn>);
        const instance = wrapper.instance() as LoggedIn;

        expect(() => {
            (instance as any).getServerTheme();
        }).not.toThrow();
    });

    it('should not post message when currentTeam is undefined', () => {
        const postMessageSpy = jest.spyOn(window, 'postMessage');

        const props = {
            ...baseProps,
            currentTeam: undefined,
        };

        const wrapper = shallow(<LoggedIn {...props}>{children}</LoggedIn>);
        const instance = wrapper.instance() as LoggedIn;
        (instance as any).getServerTheme();

        expect(postMessageSpy).not.toHaveBeenCalled();

        postMessageSpy.mockRestore();
    });

    it('should send theme when currentTeam becomes available', () => {
        const postMessageSpy = jest.spyOn(window, 'postMessage');

        const props = {
            ...baseProps,
            currentTeam: undefined,
        };

        const wrapper = shallow(<LoggedIn {...props}>{children}</LoggedIn>);

        wrapper.setProps({currentTeam: mockTeam});

        expect(postMessageSpy).toHaveBeenCalledWith(
            {
                type: 'preferred-theme',
                data: {
                    theme: Preferences.THEMES.onyx,
                    teamName: 'Test Team',
                },
            },
            window.origin,
        );

        postMessageSpy.mockRestore();
    });
});
