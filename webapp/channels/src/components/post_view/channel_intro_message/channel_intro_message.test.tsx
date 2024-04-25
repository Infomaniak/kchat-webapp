// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {Channel, ChannelType} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import {Constants} from 'utils/constants';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import ChannelIntroMessage from './channel_intro_message';

describe('components/post_view/ChannelIntroMessages', () => {
    const channel = {
        create_at: 1508265709607,
        creator_id: 'creator_id',
        delete_at: 0,
        display_name: 'test channel',
        header: 'test',
        id: 'channel_id',
        last_post_at: 1508265709635,
        name: 'testing',
        purpose: 'test',
        team_id: 'team-id',
        type: 'O',
        update_at: 1508265709607,
    } as Channel;

    const user1 = {id: 'user1', roles: 'system_user'};
    const users = [
        {id: 'user1', roles: 'system_user'},
        {id: 'guest1', roles: 'system_guest'},
    ] as UserProfile[];

    const baseProps = {
        currentUserId: 'test-user-id',
        channel,
        fullWidth: true,
        locale: 'en',
        channelProfiles: [],
        enableUserCreation: false,
        teamIsGroupConstrained: false,
        creatorName: 'creatorName',
        stats: {},
        usersLimit: 10,
        actions: {
            getTotalUsersStats: jest.fn().mockResolvedValue([]),
        },
    };

    describe('test Open Channel', () => {
        test('should match component state, without boards', () => {
            const initialState = {};
            const {container} = renderWithContext(
                <ChannelIntroMessage{...baseProps}/>, initialState,
            );
            expect(container).toMatchSnapshot();
        });
    });

    describe('test Group Channel', () => {
        const groupChannel = {
            ...channel,
            type: Constants.GM_CHANNEL as ChannelType,
        };
        const props = {
            ...baseProps,
            channel: groupChannel,
        };

        test('should match component state, no profiles', () => {
            const {container} = renderWithContext(
                <ChannelIntroMessage
                    {...props}
                />,
            );
            expect(container).toMatchSnapshot();
        });

        test('should match component state, with profiles', () => {
            const {container} = renderWithContext(
                <ChannelIntroMessage
                    {...props}
                    channelProfiles={users}
                />,
            );
            expect(container).toMatchSnapshot();
        });
    });

    describe('test DIRECT Channel', () => {
        const directChannel = {
            ...channel,
            type: Constants.DM_CHANNEL as ChannelType,
        };
        const props = {
            ...baseProps,
            channel: directChannel,
        };

        test('should match component state, without teammate', () => {
            const {container} = renderWithContext(
                <ChannelIntroMessage
                    {...props}
                />,
            );
            expect(container).toMatchSnapshot();
        });

        test('should match component state, with teammate', () => {
            const {container} = renderWithContext(
                <ChannelIntroMessage
                    {...props}
                    teammate={user1 as UserProfile}
                    teammateName='my teammate'
                />,
            );
            expect(container).toMatchSnapshot();
        });
    });

    describe('test DEFAULT Channel', () => {
        const directChannel = {
            ...channel,
            name: Constants.DEFAULT_CHANNEL,
            type: Constants.OPEN_CHANNEL as ChannelType,
        };
        const props = {
            ...baseProps,
            channel: directChannel,
        };

        test('should match component state, readonly', () => {
            const {container} = renderWithContext(
                <ChannelIntroMessage
                    {...props}
                    isReadOnly={true}
                />,
            );
            expect(container).toMatchSnapshot();
        });

        test('should match component state without any permission', () => {
            const {container} = renderWithContext(
                <ChannelIntroMessage
                    {...props}
                    teamIsGroupConstrained={true}
                />,
            );
            expect(container).toMatchSnapshot();
        });

        test('should match snapshot, with enableUserCreation', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    enableUserCreation={true}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot, with enable, group constrained', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...props}
                    enableUserCreation={true}
                    teamIsGroupConstrained={true}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('test OFFTOPIC Channel', () => {
        const directChannel = {
            ...channel,
            type: Constants.OPEN_CHANNEL as ChannelType,
            name: Constants.OFFTOPIC_CHANNEL,
        };
        const props = {
            ...baseProps,
            channel: directChannel,
        };

        test('should match component state', () => {
            const {container} = renderWithContext(
                <ChannelIntroMessage
                    {...props}
                />,
            );
            expect(container).toMatchSnapshot();
        });
    });
});
