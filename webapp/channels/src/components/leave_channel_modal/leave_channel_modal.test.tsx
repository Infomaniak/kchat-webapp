// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import LeaveChannelModal from 'components/leave_channel_modal/leave_channel_modal';

describe('components/LeaveChannelModal', () => {
    const channels = {
        'channel-1': {
            id: 'channel-1',
            name: 'test-channel-1',
            display_name: 'Test Channel 1',
            type: ('P' as ChannelType),
            team_id: 'team-1',
            header: '',
            purpose: '',
            creator_id: '',
            scheme_id: '',
            group_constrained: false,
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            last_post_at: 0,
            last_root_post_at: 0,
        },
        'channel-2': {
            id: 'channel-2',
            name: 'test-channel-2',
            display_name: 'Test Channel 2',
            team_id: 'team-1',
            type: ('P' as ChannelType),
            header: '',
            purpose: '',
            creator_id: '',
            scheme_id: '',
            group_constrained: false,
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            last_post_at: 0,
            last_root_post_at: 0,
        },
        'town-square': {
            id: 'town-square-id',
            name: 'town-square',
            display_name: 'Town Square',
            type: ('O' as ChannelType),
            team_id: 'team-1',
            header: '',
            purpose: '',
            creator_id: '',
            scheme_id: '',
            group_constrained: false,
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            last_post_at: 0,
            last_root_post_at: 0,
        },
    };

    test('should match snapshot, init', () => {
        const props = {
            channel: channels['town-square'],
            onExited: jest.fn(),
            actions: {
                leaveChannel: jest.fn(),
            },
        };

        const wrapper = shallow<typeof LeaveChannelModal>(
            <LeaveChannelModal
                {...props}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should fail to leave channel', () => {
        const props = {
            channel: {
                id: 'channel7',
                name: 'test-channel-7',
                display_name: 'Test Channel 1',
                type: ('P' as ChannelType),
                team_id: 'team-1',
                header: '',
                purpose: '',
                creator_id: '',
                scheme_id: '',
                group_constrained: false,
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                last_post_at: 0,
                last_root_post_at: 0,
            },
            actions: {
                leaveChannel: jest.fn().mockImplementation(() => {
                    const error = {
                        message: 'error leaving channel',
                    };

                    return Promise.resolve({error});
                }),
                getChannelStats: jest.fn(),
                getChannelMember: jest.fn(),
                updateChannelMemberSchemeRoles: jest.fn().mockResolvedValue({data: true}),
                loadStatusesForProfilesList: jest.fn(),
                addUsersToChannel: jest.fn().mockResolvedValue({data: true}),
                searchProfiles: jest.fn().mockResolvedValue({data: true}),
                getProfilesNotInChannel: jest.fn().mockResolvedValue({data: true}),
                searchAssociatedGroupsForReference: jest.fn().mockResolvedValue({data: true}),
                getTeamStats: jest.fn(),
                closeModal: jest.fn(),
                getProfilesInChannel: jest.fn().mockResolvedValue({data: true}),
                getTeamMembersByIds: jest.fn().mockResolvedValue({data: true}),
                loadProfilesAndReloadChannelMembers: jest.fn(),
            },
            currentUser: {user_id: 'user-1'},
            onExited: jest.fn(),
            callback: jest.fn(),
            profilesInCurrentChannel: [{id: 'user1'}],
            canManageMembers: true,
        };
        const wrapper = shallow<typeof LeaveChannelModal>(
            <LeaveChannelModal
                {...props}
            />,
        );

        const button = wrapper.find('[data-testid="confirmModalButton"]');
        button.simulate('click');

        expect(props.actions.leaveChannel).toHaveBeenCalledTimes(1);
        expect(props.callback).toHaveBeenCalledTimes(0);
        expect(wrapper.find('.leave-button').exists()).toBe(true);
    });

    test(('should show modal if there is one admin in the channel'), async () => {
        const props = {
            channel: {
                id: 'channel1',
                name: 'channel1',
                display_name: 'Test Channel 1',
                type: ('P' as ChannelType),
                team_id: 'team-1',
                header: '',
                purpose: '',
                creator_id: '',
                scheme_id: '',
                group_constrained: false,
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                last_post_at: 0,
                last_root_post_at: 0,
            },
            actions: {
                leaveChannel: jest.fn(),
                getChannelStats: jest.fn(),
                getChannelMember: jest.fn(),
                updateChannelMemberSchemeRoles: jest.fn().mockResolvedValue({data: true}),
                loadStatusesForProfilesList: jest.fn(),
                addUsersToChannel: jest.fn().mockResolvedValue({data: true}),
                searchProfiles: jest.fn().mockResolvedValue({data: true}),
                getProfilesNotInChannel: jest.fn().mockResolvedValue({data: true}),
                searchAssociatedGroupsForReference: jest.fn().mockResolvedValue({data: true}),
                getTeamStats: jest.fn(),
                closeModal: jest.fn(),
                getProfilesInChannel: jest.fn().mockResolvedValue({data: true}),
                getTeamMembersByIds: jest.fn().mockResolvedValue({data: true}),
                loadProfilesAndReloadChannelMembers: jest.fn(),
            },
            currentUser: {user_id: 'user-1'},
            onExited: jest.fn(),
            callback: jest.fn(),
            currentUserIsChannelAdmin: true,
            profilesInCurrentChannel: [{id: 'user1'}, {id: 'user-2'}],
            canManageMembers: true,
        };

        const wrapper = shallow<typeof LeaveChannelModal>(
            <LeaveChannelModal
                {...props}
            />,
        );

        expect(wrapper.find('.test-channel-1-download').exists()).toBe(true);
    });
});
