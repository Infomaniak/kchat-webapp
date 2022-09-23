// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import {UserNotifyProps} from '@mattermost/types/users';

import RhsSettingsNotifications from './rhs_settings_notifications';

describe('components/rhs_settings/rhs_settings_display/RhsSettingsDisplay', () => {
    const user = TestHelper.getUserMock({
        id: 'user_id',
    });

    const requiredProps: ComponentProps<typeof RhsSettingsNotifications> = {
        user,
        updateSection: jest.fn(),
        activeSection: '',
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        actions: {
            updateMe: jest.fn(() => Promise.resolve({})),
        },
        isCollapsedThreadsEnabled: false,
        sendPushNotifications: false,
        enableAutoResponder: false,
    };

    test('should have called handleSubmit', async () => {
        const props = {...requiredProps, actions: {...requiredProps.actions}};
        const wrapper = shallow<RhsSettingsNotifications>(
            <RhsSettingsNotifications {...props}/>,
        );

        await wrapper.instance().handleSubmit();
        expect(requiredProps.actions.updateMe).toHaveBeenCalled();
    });

    test('should have called handleSubmit', async () => {
        const updateMe = jest.fn(() => Promise.resolve({data: true}));

        const props = {...requiredProps, actions: {...requiredProps.actions, updateMe}};
        const wrapper = shallow<RhsSettingsNotifications>(
            <RhsSettingsNotifications {...props}/>,
        );

        await wrapper.instance().handleSubmit();
        expect(requiredProps.updateSection).toHaveBeenCalled();
        expect(requiredProps.updateSection).toHaveBeenCalledWith('');
    });

    test('should reset state when handleUpdateSection is called', () => {
        const newUpdateSection = jest.fn();
        const updateArg = 'unreadChannels';
        const props = {...requiredProps, updateSection: newUpdateSection, user: {...user, notify_props: {desktop: 'on'} as unknown as UserNotifyProps}};
        const wrapper = shallow<RhsSettingsNotifications>(
            <RhsSettingsNotifications {...props}/>,
        );

        wrapper.setState({isSaving: true, desktopActivity: 'off' as unknown as UserNotifyProps['desktop']});
        wrapper.instance().handleUpdateSection(updateArg);

        expect(wrapper.state('isSaving')).toEqual(false);
        expect(wrapper.state('desktopActivity')).toEqual('on');
        expect(newUpdateSection).toHaveBeenCalledTimes(1);
    });
});
