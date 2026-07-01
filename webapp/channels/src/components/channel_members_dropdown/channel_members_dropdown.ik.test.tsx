import {fireEvent, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {LeaveChannelConstraint} from 'mattermost-redux/selectors/entities/channels';

import {TestHelper} from 'utils/test_helper';

import {renderWithContext} from 'tests/react_testing_utils';

import ChannelMembersDropdown from './channel_members_dropdown';
import type {Props} from './channel_members_dropdown';

describe('ChannelMembersDropdown', () => {
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

    const defaultActions: Props['actions'] = {
        getChannelStats: jest.fn(),
        updateChannelMemberSchemeRoles: jest.fn().mockResolvedValue({}),
        getChannelMember: jest.fn(),
        requestLeaveChannel: jest.fn().mockResolvedValue({data: undefined}),
        requestRemoveChannelMember: jest.fn().mockResolvedValue({}),
        openModal: jest.fn(),
    };

    const baseProps: Props = {
        channel,
        user,
        currentUserId: 'admin1',
        channelMember: membership,
        canChangeMemberRoles: false,
        canRemoveMember: true,
        leaveChannelConstraint: LeaveChannelConstraint.LEAVE,
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

    it('calls requestRemoveChannelMember when removing another member', async () => {
        renderWithContext(<ChannelMembersDropdown {...baseProps}/>);
        openMenuAndClickRemove();

        await waitFor(() => {
            expect(defaultActions.requestRemoveChannelMember).toHaveBeenCalledWith(channel, 'user1', []);
        });
    });

    it('calls requestLeaveChannel when removing self', async () => {
        const props: Props = {
            ...baseProps,
            user: TestHelper.getUserMock({id: 'admin1', username: 'admin', roles: 'system_user'}),
        };
        renderWithContext(<ChannelMembersDropdown {...props}/>);

        const button = screen.getByRole('button', {name: /admin/i});
        fireEvent.click(button);
        const leaveItem = screen.getByText('Leave Channel');
        fireEvent.click(leaveItem);

        await waitFor(() => {
            expect(defaultActions.requestLeaveChannel).toHaveBeenCalledWith(channel);
        });
    });

    it('displays server error if requestRemoveChannelMember fails', async () => {
        const requestRemoveChannelMember = jest.fn().mockResolvedValue({error: {message: 'network error'}});
        const props: Props = {
            ...baseProps,
            actions: {...defaultActions, requestRemoveChannelMember},
        };
        renderWithContext(<ChannelMembersDropdown {...props}/>);
        openMenuAndClickRemove();

        await waitFor(() => {
            expect(screen.getByText('network error')).toBeInTheDocument();
        });
    });

    it('blocks removal and opens group overlap modal', async () => {
        const group1 = TestHelper.getGroupMock({id: 'g1', display_name: 'Engineering', member_count: 5});
        const requestRemoveChannelMember = jest.fn().mockResolvedValue({data: {groupOverlap: [group1]}});
        const openModal = jest.fn();
        const props: Props = {
            ...baseProps,
            channelGroups: [group1],
            actions: {...defaultActions, requestRemoveChannelMember, openModal},
        };
        renderWithContext(<ChannelMembersDropdown {...props}/>);
        openMenuAndClickRemove();

        await waitFor(() => {
            expect(requestRemoveChannelMember).toHaveBeenCalledWith(channel, 'user1', [group1]);
            expect(openModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    modalId: 'member_in_group_modal',
                    dialogProps: expect.objectContaining({
                        groups: [group1],
                    }),
                }),
            );
        });
    });
});
