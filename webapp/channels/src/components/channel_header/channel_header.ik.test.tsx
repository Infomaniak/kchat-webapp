// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {RHSStates} from 'utils/constants';

import type {MockIntl} from 'tests/helpers/intl-test-helper';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import ChannelHeader from './channel_header';
import type {Props} from './channel_header';

import {TestHelper} from '../../utils/test_helper';

describe('components/ChannelHeader', () => {
    const baseProps: Props = {
        actions: {
            showPinnedPosts: jest.fn(),
            showChannelFiles: jest.fn(),
            closeRightHandSide: jest.fn(),
            getCustomEmojisInText: jest.fn(),
            updateChannelNotifyProps: jest.fn(),
            showChannelMembers: jest.fn(),
        },
        teamId: 'team_id',
        channel: TestHelper.getChannelMock({}),
        channelMember: TestHelper.getChannelMembershipMock({}),
        currentUser: TestHelper.getUserMock({}),
        isCustomStatusEnabled: false,
        isCustomStatusExpired: false,
        isFileAttachmentsEnabled: true,
        lastActivityTimestamp: 1632146562846,
        isLastActiveEnabled: true,
        memberCount: 2,
        dmUser: undefined,
        gmMembers: undefined,
        rhsState: RHSStates.CHANNEL_INFO,
        isChannelMuted: false,
        hasGuests: false,
        pinnedPostsCount: 0,
        customStatus: undefined,
        timestampUnits: [
            'now',
            'minute',
            'hour',
        ],
        hideGuestTags: false,
        intl: {
            formatMessage: jest.fn(({id, defaultMessage}) => defaultMessage || id),
        } as MockIntl,
    };

    const populatedProps = {
        ...baseProps,
        channel: TestHelper.getChannelMock({
            id: 'channel_id',
            team_id: 'team_id',
            name: 'Test',
            delete_at: 0,
        }),
        channelMember: TestHelper.getChannelMembershipMock({
            channel_id: 'channel_id',
            user_id: 'user_id',
        }),
        currentUser: TestHelper.getUserMock({
            id: 'user_id',
            bot_description: 'the bot description',
        }),
    };

    test('should not render Meet button when canPost is false', () => {
        const props = {
            ...populatedProps,
            canPost: false,
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );
        expect(wrapper.find('Connect(MeetButton)').exists()).toBe(false);
    });

    test('should render Meet button when canPost is true', () => {
        const props = {
            ...populatedProps,
            canPost: true,
        };

        const wrapper = shallowWithIntl(
            <ChannelHeader {...props}/>,
        );

        expect(wrapper.find('Connect(MeetButton)').exists()).toBe(true);
    });
});
