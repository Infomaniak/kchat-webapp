// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import type {ComponentProps} from 'react';
import React from 'react';

import {NotificationLevels} from 'utils/constants';

import DesktopNotificationSettings from './desktop_notification_settings';

jest.mock('utils/utils', () => {
    const original = jest.requireActual('utils/utils');
    return {
        ...original,
        hasSoundOptions: jest.fn(() => true),
    };
});

describe('components/user_settings/notifications/DesktopNotificationSettings', () => {
    const baseProps: ComponentProps<typeof DesktopNotificationSettings> = {
        activity: NotificationLevels.MENTION,
        sound: 'false',
        updateSection: jest.fn(),
        setParentState: jest.fn(),
        submit: jest.fn(),
        cancel: jest.fn(),
        error: '',
        active: true,
        saving: false,
        selectedSound: 'Bing',
        threads: NotificationLevels.ALL,
    };

    test('should match snapshot, on max setting', () => {
        const wrapper = shallow(
            <DesktopNotificationSettings {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on max setting with sound enabled', () => {
        const props = {...baseProps, sound: 'true'};
        const wrapper = shallow(
            <DesktopNotificationSettings {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on min setting', () => {
        const props = {...baseProps, active: false};
        const wrapper = shallow(
            <DesktopNotificationSettings {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call props.updateSection on handleMaxUpdateSection', () => {
        const props = {...baseProps, updateSection: jest.fn()};
        const wrapper = shallow<DesktopNotificationSettings>(
            <DesktopNotificationSettings {...props}/>,
        );

        wrapper.instance().handleMaxUpdateSection('');
        expect(props.updateSection).toHaveBeenCalledTimes(1);
        expect(props.updateSection).toHaveBeenCalledWith('');

        wrapper.instance().handleMaxUpdateSection('desktop');
        expect(props.updateSection).toHaveBeenCalledTimes(2);
        expect(props.updateSection).toHaveBeenCalledWith('desktop');
    });

    test('should call props.setParentState on handleOnChange', () => {
        const props = {...baseProps, setParentState: jest.fn()};
        const wrapper = shallow<DesktopNotificationSettings>(
            <DesktopNotificationSettings {...props}/>,
        );

        wrapper.instance().handleOnChange({
            currentTarget: {getAttribute: (key: string) => {
                return {'data-key': 'dataKey', 'data-value': 'dataValue'}[key];
            }},
        } as unknown as React.ChangeEvent<HTMLInputElement>);

        expect(props.setParentState).toHaveBeenCalledTimes(1);
        expect(props.setParentState).toHaveBeenCalledWith('dataKey', 'dataValue');
    });

    test('should match snapshot, on createNotificationsSelect', () => {
        const wrapper = shallow<DesktopNotificationSettings>(
            <DesktopNotificationSettings {...baseProps}/>,
        );

        expect(wrapper.instance().createNotificationsSelect()).toMatchSnapshot();

        wrapper.setProps({activity: NotificationLevels.NONE});
        expect(wrapper.instance().createNotificationsSelect()).toMatchSnapshot();
    });
});
