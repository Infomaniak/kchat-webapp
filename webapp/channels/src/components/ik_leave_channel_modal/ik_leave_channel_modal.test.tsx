// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {act, fireEvent, screen} from '@testing-library/react';
import React from 'react';

import type {ChannelType} from '@mattermost/types/channels';

import LeaveChannelModal from 'components/ik_leave_channel_modal/ik_leave_channel_modal';

import {renderWithContext} from 'tests/react_testing_utils';

describe('components/LeaveChannelModal', () => {
    test('should match snapshot, init', () => {
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
                deleteChannel: jest.fn(),
                getChannelMemberAction: jest.fn(),
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
            currentUser: {
                user_id: 'user-1',
                channel_id: 'channel7',
                roles: 'channel_user',
                last_viewed_at: 0,
                msg_count: 0,
                msg_count_root: 0,
                mention_count: 0,
                mention_count_root: 0,
                urgent_mention_count: 0,
                notify_props: {},
                last_update_at: 0,
                scheme_user: true,
                scheme_admin: false,
            },
            onExited: jest.fn(),
            callback: jest.fn(),
            profilesInCurrentChannel: [{id: 'user1'}],
            isInvite: true,
        };

        const wrapper = renderWithContext(

            // @ts-expect-error old error
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
                deleteChannel: jest.fn(),
                getChannelMemberAction: jest.fn(),
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
            currentUser: {
                user_id: 'user-1',
                channel_id: 'channel7',
                roles: 'channel_user',
                last_viewed_at: 0,
                msg_count: 0,
                msg_count_root: 0,
                mention_count: 0,
                mention_count_root: 0,
                urgent_mention_count: 0,
                notify_props: {},
                last_update_at: 0,
                scheme_user: true,
                scheme_admin: false,
            },
            onExited: jest.fn(),
            callback: jest.fn(),
            profilesInCurrentChannel: [{id: 'user1'}],
            isInvite: true,
        };
        renderWithContext(

            // @ts-expect-error old error
            <LeaveChannelModal
                {...props}
            />,
        );

        const button = screen.getByTestId('confirmModalButton');
        fireEvent.click(button);
        expect(props.actions.leaveChannel).toHaveBeenCalledTimes(1);
        expect(props.callback).toHaveBeenCalledTimes(0);
        expect(button).toBeInTheDocument();
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
                deleteChannel: jest.fn(),
                getChannelMemberAction: jest.fn(),
                loadProfilesAndReloadChannelMembers: jest.fn(),
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
            },
            currentUser: {
                user_id: 'user-1',
                channel_id: 'channel7',
                roles: 'channel_user',
                last_viewed_at: 0,
                msg_count: 0,
                msg_count_root: 0,
                mention_count: 0,
                mention_count_root: 0,
                urgent_mention_count: 0,
                notify_props: {},
                last_update_at: 0,
                scheme_user: true,
                scheme_admin: false,
            },
            onExited: jest.fn(),
            callback: jest.fn(),
            hasChannelMembersAdmin: true,
            currentUserIsChannelAdmin: true,
            profilesInCurrentChannel: [{id: 'user1'}, {id: 'user-2'}],
            isInvite: true,
            currentMemberIsChannelAdmin: true,
        };

        await act(async () => {
            renderWithContext(

                // @ts-expect-error old error
                <LeaveChannelModal
                    {...props}
                />,
            );
        });
        const button = screen.getByTestId('test-channel-1-download');
        expect(button).toBeInTheDocument();
    });
});
