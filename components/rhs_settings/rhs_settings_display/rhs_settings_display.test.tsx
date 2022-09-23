// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import {Provider} from 'react-redux';

import {UserProfile} from '@mattermost/types/users';

import configureStore from 'store';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import RhsSettingsDisplay from './rhs_settings_display';

describe('components/rhs_settings/rhs_settings_display/RhsSettingsDisplay', () => {
    const user = {
        id: 'user_id',
        username: 'username',
        locale: 'en',
        timezone: {
            useAutomaticTimezone: 'true',
            automaticTimezone: 'America/New_York',
            manualTimezone: '',
        },
    };

    const requiredProps = {
        user: user as UserProfile,
        updateSection: jest.fn(),
        activeSection: '',
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        setRequireConfirm: jest.fn(),
        setEnforceFocus: jest.fn(),
        enableLinkPreviews: true,
        enableThemeSelection: false,
        defaultClientLocale: 'en',
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
        timezoneLabel: '',
        timezones: [
            {
                value: 'Caucasus Standard Time',
                abbr: 'CST',
                offset: 4,
                isdst: false,
                text: '(UTC+04:00) Yerevan',
                utc: [
                    'Asia/Yerevan',
                ],
            },
            {
                value: 'Afghanistan Standard Time',
                abbr: 'AST',
                offset: 4.5,
                isdst: false,
                text: '(UTC+04:30) Kabul',
                utc: [
                    'Asia/Kabul',
                ],
            },
        ],
        userTimezone: {
            useAutomaticTimezone: 'true',
            automaticTimezone: 'America/New_York',
            manualTimezone: '',
        },
        actions: {
            autoUpdateTimezone: jest.fn(),
            savePreferences: jest.fn(),
        },

        configTeammateNameDisplay: '',
        currentUserTimezone: 'America/New_York',
        enableTimezone: true,
        shouldAutoUpdateTimezone: true,
        lockTeammateNameDisplay: false,
        collapsedReplyThreads: '',
        collapsedReplyThreadsAllowUserPreference: true,
        allowCustomThemes: true,
        availabilityStatusOnPosts: '',
        militaryTime: '',
        teammateNameDisplay: '',
        channelDisplayMode: '',
        messageDisplay: '',
        colorizeUsernames: '',
        collapseDisplay: '',
        linkPreviewDisplay: '',
        globalHeaderDisplay: '',
        globalHeaderAllowed: true,
        oneClickReactionsOnPosts: '',
        emojiPickerEnabled: true,
        clickToReply: '',
    };

    let store: ReturnType<typeof configureStore>;
    beforeEach(() => {
        store = configureStore();
    });

    test('should match snapshot, no active section', () => {
        const wrapper = shallow(<RhsSettingsDisplay {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, collapse section', () => {
        const props = {...requiredProps, activeSection: 'collapse'};
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, link preview section with EnableLinkPreviews is false', () => {
        const props = {
            ...requiredProps,
            activeSection: 'linkpreview',
            enableLinkPreviews: false,
        };
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, link preview section with EnableLinkPreviews is true', () => {
        const props = {
            ...requiredProps,
            activeSection: 'linkpreview',
            enableLinkPreviews: true,
        };
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, clock section', () => {
        const props = {...requiredProps, activeSection: 'clock'};
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, teammate name display section', () => {
        const props = {...requiredProps, activeSection: 'teammate_name_display'};
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, timezone section', () => {
        const props = {...requiredProps, activeSection: 'timezone'};
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, message display section', () => {
        const props = {...requiredProps, activeSection: 'message_display'};
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, channel display mode section', () => {
        const props = {...requiredProps, activeSection: 'channel_display_mode'};
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, languages section', () => {
        const props = {...requiredProps, activeSection: 'languages'};
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, theme section with EnableThemeSelection is false', () => {
        const props = {
            ...requiredProps,
            activeSection: 'theme',
            enableThemeSelection: false,
        };
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, theme section with EnableThemeSelection is true', () => {
        const props = {
            ...requiredProps,
            activeSection: 'theme',
            enableThemeSelection: true,
        };
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, clickToReply section', () => {
        const props = {...requiredProps, activeSection: 'click_to_reply'};
        const wrapper = shallow(<RhsSettingsDisplay {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called handleSubmit', async () => {
        const updateSection = jest.fn();

        const props = {...requiredProps, updateSection};
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RhsSettingsDisplay {...props}/>
            </Provider>,
        ).find(RhsSettingsDisplay);

        await (wrapper.instance() as RhsSettingsDisplay).handleSubmit();
        expect(updateSection).toHaveBeenCalledWith('');
    });

    test('should have called updateSection', () => {
        const updateSection = jest.fn();

        const props = {...requiredProps, updateSection};
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RhsSettingsDisplay {...props}/>
            </Provider>,
        ).find(RhsSettingsDisplay);

        (wrapper.instance() as RhsSettingsDisplay).updateSection('');
        expect(updateSection).toHaveBeenCalledWith('');

        (wrapper.instance() as RhsSettingsDisplay).updateSection('linkpreview');
        expect(updateSection).toHaveBeenCalledWith('linkpreview');
    });

    test('should update channelDisplayMode state', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RhsSettingsDisplay {...requiredProps}/>
            </Provider>,
        ).find(RhsSettingsDisplay);

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({channelDisplayMode: 'full'});
        expect(wrapper.state('channelDisplayMode')).toBe('full');

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({channelDisplayMode: 'centered'});
        expect(wrapper.state('channelDisplayMode')).toBe('centered');
    });

    test('should update messageDisplay state', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RhsSettingsDisplay {...requiredProps}/>
            </Provider>,
        ).find(RhsSettingsDisplay);

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({messageDisplay: 'clean'});
        expect(wrapper.state('messageDisplay')).toBe('clean');

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({messageDisplay: 'compact'});
        expect(wrapper.state('messageDisplay')).toBe('compact');
    });

    test('should update collapseDisplay state', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RhsSettingsDisplay {...requiredProps}/>
            </Provider>,
        ).find(RhsSettingsDisplay);

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({collapseDisplay: 'false'});
        expect(wrapper.state('collapseDisplay')).toBe('false');

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({collapseDisplay: 'true'});
        expect(wrapper.state('collapseDisplay')).toBe('true');
    });

    test('should update linkPreviewDisplay state', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RhsSettingsDisplay {...requiredProps}/>
            </Provider>,
        ).find(RhsSettingsDisplay);

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({linkPreviewDisplay: 'false'});
        expect(wrapper.state('linkPreviewDisplay')).toBe('false');

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({linkPreviewDisplay: 'true'});
        expect(wrapper.state('linkPreviewDisplay')).toBe('true');
    });

    test('should update display state', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RhsSettingsDisplay {...requiredProps}/>
            </Provider>,
        ).find(RhsSettingsDisplay);

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({display: 'linkPreviewDisplay'});
        expect(wrapper.state('display')).toBe('linkPreviewDisplay');

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({display: 'collapseDisplay'});
        expect(wrapper.state('display')).toBe('collapseDisplay');
    });

    test('should update collapsed reply threads state', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RhsSettingsDisplay {...requiredProps}/>
            </Provider>,
        ).find(RhsSettingsDisplay);

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({collapsedReplyThreads: 'off'});
        expect(wrapper.state('collapsedReplyThreads')).toBe('off');

        (wrapper.instance() as RhsSettingsDisplay).handleOnChange({collapsedReplyThreads: 'on'});
        expect(wrapper.state('collapsedReplyThreads')).toBe('on');
    });
});
