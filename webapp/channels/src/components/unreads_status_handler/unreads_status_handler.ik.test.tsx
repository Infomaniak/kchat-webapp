// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {KSuiteBridge} from '@infomaniak/ksuite-bridge';
import {UpdateBadgeMessageKey} from '@infomaniak/ksuite-bridge';
import type {ShallowWrapper} from 'enzyme';
import type {ComponentProps} from 'react';
import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';
import type {TeamType} from '@mattermost/types/teams';

import UnreadsStatusHandler from 'components/unreads_status_handler/unreads_status_handler';
import type {UnreadsStatusHandlerClass} from 'components/unreads_status_handler/unreads_status_handler';

import {Constants} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

type Props = ComponentProps<typeof UnreadsStatusHandlerClass>;

jest.mock('utils/user_agent', () => {
    const original = jest.requireActual('utils/user_agent');
    return {
        ...original,
        isFirefox: jest.fn().mockReturnValue(true),
        isChrome: jest.fn(),
    };
});

describe('components/UnreadsStatusHandler - KSuite integration', () => {
    const mockSendMessage = jest.fn();
    const mockKSuiteBridge = {
        sendMessage: mockSendMessage,
    } as unknown as KSuiteBridge;

    const defaultProps: Props = {
        unreadStatus: false,
        siteName: 'Test site',
        currentChannel: TestHelper.getChannelMock({
            id: 'c1',
            display_name: 'Public test 1',
            name: 'public-test-1',
            type: Constants.OPEN_CHANNEL as ChannelType,
        }),
        currentTeam: TestHelper.getTeamMock({
            id: 'team_id',
            name: 'test-team',
            display_name: 'Test team display name',
            description: 'Test team description',
            type: 'team-type' as TeamType,
        }),
        currentTeammate: null,
        inGlobalThreads: false,
        inDrafts: false,
        inScheduledPosts: false,
        kSuiteBridge: mockKSuiteBridge,
    };

    beforeEach(() => {
        mockSendMessage.mockClear();
    });

    test('should notify KSuite bridge with mention count when there are mentions', () => {
        const wrapper = shallowWithIntl(
            <UnreadsStatusHandler {...defaultProps}/>,
        ) as unknown as ShallowWrapper<Props, any, UnreadsStatusHandlerClass>;
        const instance = wrapper.instance();

        wrapper.setProps({unreadStatus: 5});
        instance.notifyKSuiteBridge();

        expect(mockSendMessage).toHaveBeenCalledWith({
            type: UpdateBadgeMessageKey,
            value: 5,
        });
    });

    test('should notify KSuite bridge with true when there are unreads but no mentions', () => {
        const wrapper = shallowWithIntl(
            <UnreadsStatusHandler {...defaultProps}/>,
        ) as unknown as ShallowWrapper<Props, any, UnreadsStatusHandlerClass>;
        const instance = wrapper.instance();

        wrapper.setProps({unreadStatus: true});
        instance.notifyKSuiteBridge();

        expect(mockSendMessage).toHaveBeenCalledWith({
            type: UpdateBadgeMessageKey,
            value: true,
        });
    });

    test('should notify KSuite bridge with false when there are no unreads', () => {
        const wrapper = shallowWithIntl(
            <UnreadsStatusHandler {...defaultProps}/>,
        ) as unknown as ShallowWrapper<Props, any, UnreadsStatusHandlerClass>;
        const instance = wrapper.instance();

        wrapper.setProps({unreadStatus: false});
        instance.notifyKSuiteBridge();

        expect(mockSendMessage).toHaveBeenCalledWith({
            type: UpdateBadgeMessageKey,
            value: false,
        });
    });

    test('should not call sendMessage when kSuiteBridge is not provided', () => {
        const wrapper = shallowWithIntl(
            <UnreadsStatusHandler
                {...defaultProps}
                kSuiteBridge={undefined as unknown as KSuiteBridge}
            />,
        ) as unknown as ShallowWrapper<Props, any, UnreadsStatusHandlerClass>;
        const instance = wrapper.instance();

        instance.notifyKSuiteBridge();

        expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test('should call notifyKSuiteBridge on componentDidUpdate', () => {
        const wrapper = shallowWithIntl(
            <UnreadsStatusHandler {...defaultProps}/>,
        ) as unknown as ShallowWrapper<Props, any, UnreadsStatusHandlerClass>;
        const instance = wrapper.instance();
        const spy = jest.spyOn(instance, 'notifyKSuiteBridge');

        wrapper.setProps({unreadStatus: 3});

        expect(spy).toHaveBeenCalled();
    });
});
