import {fireEvent, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {Client4} from 'mattermost-redux/client';

import {TestHelper} from 'utils/test_helper';

import {renderWithContext} from 'tests/react_testing_utils';

import ChannelMembersDropdown from './channel_members_dropdown';
import type {Props} from './channel_members_dropdown';

jest.mock('mattermost-redux/client', () => ({
    Client4: {
        getGroupsByUserId: jest.fn(),
    },
}));

describe('ChannelMembersDropdown group overlap logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const channel = TestHelper.getChannelMock({id: 'ch1', type: 'O' as const, name: 'test-channel', team_id: 'team1'});
    const user = TestHelper.getUserMock({id: 'user1', username: 'testuser', roles: 'system_user'});
    const membership = TestHelper.getChannelMembershipMock({
        channel_id: 'ch1',
        user_id: 'user1',
        scheme_admin: false,
        scheme_user: true,
        roles: '',
    });

    const group1 = TestHelper.getGroupMock({id: 'g1', display_name: 'Engineering', member_count: 5});

    const defaultActions: Props['actions'] = {
        getChannelStats: jest.fn(),
        updateChannelMemberSchemeRoles: jest.fn().mockResolvedValue({}),
        removeChannelMember: jest.fn().mockResolvedValue({}),
        getChannelMember: jest.fn(),
        openModal: jest.fn(),
        getGroupsByUserId: jest.fn().mockResolvedValue({data: []}),
    };

    const baseProps: Props = {
        channel,
        user,
        currentUserId: 'admin1',
        channelMember: membership,
        canChangeMemberRoles: false,
        canRemoveMember: true,
        hasChannelMembersAdmin: false,
        channelGroups: [],
        isSystemAdmin: false,
        index: 0,
        totalUsers: 5,
        actions: defaultActions,
    };

    const openMenuAndClickRemove = () => {
        const button = screen.getByRole('button', {name: /testuser/i});
        fireEvent.click(button);
        const removeItem = screen.getByText('Remove from Channel');
        fireEvent.click(removeItem);
    };

    it('calls openModal with IkMemberInGroupModal when user overlaps with channel group', async () => {
        const openModalMock = jest.fn();
        (Client4.getGroupsByUserId as jest.Mock).mockResolvedValue([group1]);

        const props: Props = {
            ...baseProps,
            channelGroups: [group1],
            actions: {...defaultActions, openModal: openModalMock},
        };

        renderWithContext(<ChannelMembersDropdown {...props}/>);
        openMenuAndClickRemove();

        await waitFor(() => {
            expect(Client4.getGroupsByUserId).toHaveBeenCalledWith('user1');
        });

        await waitFor(() => {
            expect(openModalMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    modalId: 'member_in_group_modal',
                    dialogProps: expect.objectContaining({
                        groups: [group1],
                    }),
                }),
            );
        });
    });

    it('proceeds with removal when user has no group overlap', async () => {
        const removeChannelMember = jest.fn().mockResolvedValue({});
        (Client4.getGroupsByUserId as jest.Mock).mockResolvedValue([{id: 'other-group', display_name: 'Other'}]);

        const props: Props = {
            ...baseProps,
            channelGroups: [group1],
            actions: {...defaultActions, removeChannelMember},
        };

        renderWithContext(<ChannelMembersDropdown {...props}/>);
        openMenuAndClickRemove();

        await waitFor(() => {
            expect(removeChannelMember).toHaveBeenCalledWith('ch1', 'user1');
        });
    });

    it('proceeds with removal when there are no channel groups', async () => {
        const removeChannelMember = jest.fn().mockResolvedValue({});

        const props: Props = {
            ...baseProps,
            channelGroups: [],
            actions: {...defaultActions, removeChannelMember},
        };

        renderWithContext(<ChannelMembersDropdown {...props}/>);
        openMenuAndClickRemove();

        await waitFor(() => {
            expect(removeChannelMember).toHaveBeenCalledWith('ch1', 'user1');
        });
    });

    it('proceeds with removal when getGroupsByUserId fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const removeChannelMember = jest.fn().mockResolvedValue({});
        (Client4.getGroupsByUserId as jest.Mock).mockRejectedValue(new Error('network'));

        const props: Props = {
            ...baseProps,
            channelGroups: [group1],
            actions: {...defaultActions, removeChannelMember},
        };

        renderWithContext(<ChannelMembersDropdown {...props}/>);
        openMenuAndClickRemove();

        await waitFor(() => {
            expect(removeChannelMember).toHaveBeenCalledWith('ch1', 'user1');
        });

        consoleSpy.mockRestore();
    });
});
