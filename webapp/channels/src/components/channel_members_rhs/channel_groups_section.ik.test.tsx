// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {AutoSizerProps} from 'react-virtualized-auto-sizer';

import type {Group} from '@mattermost/types/groups';

import {TestHelper} from 'utils/test_helper';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import ChannelMembersRHS from './channel_members_rhs';
import type {Props} from './channel_members_rhs';

jest.mock('react-virtualized-auto-sizer', () => (props: AutoSizerProps) => props.children({height: 800, width: 400}));

describe('channel_members_rhs groups section', () => {
    const channel = TestHelper.getChannelMock({id: 'ch1', type: 'O' as const, name: 'test-channel', team_id: 'team1'});

    const adminUser = TestHelper.getUserMock({id: 'admin1', username: 'admin_user'});
    const regularUser = TestHelper.getUserMock({id: 'user1', username: 'regular_user'});

    const adminMember = {
        user: adminUser,
        membership: TestHelper.getChannelMembershipMock({
            channel_id: 'ch1',
            user_id: 'admin1',
            scheme_admin: true,
            scheme_user: true,
        }),
        status: 'online',
        displayName: 'Admin User',
    };

    const regularMember = {
        user: regularUser,
        membership: TestHelper.getChannelMembershipMock({
            channel_id: 'ch1',
            user_id: 'user1',
            scheme_admin: false,
            scheme_user: true,
        }),
        status: 'online',
        displayName: 'Regular User',
    };

    const mockGroup1: Group = TestHelper.getGroupMock({
        id: 'group1',
        name: 'engineering',
        display_name: 'Engineering',
        member_count: 9,
    });

    const mockGroup2: Group = TestHelper.getGroupMock({
        id: 'group2',
        name: 'design',
        display_name: 'Design',
        member_count: 4,
    });

    const defaultActions: Props['actions'] = {
        openModal: jest.fn(),
        openDirectChannelToUserId: jest.fn().mockResolvedValue({data: channel}),
        closeRightHandSide: jest.fn(),
        goBack: jest.fn(),
        setChannelMembersRhsSearchTerm: jest.fn(),
        loadProfilesAndReloadChannelMembers: jest.fn(),
        loadMyChannelMemberAndRole: jest.fn(),
        setEditChannelMembers: jest.fn(),
        searchProfilesAndChannelMembers: jest.fn().mockResolvedValue({data: []}),
        getChannelPendingGuests: jest.fn(),
        fetchChannelGroups: jest.fn(),
    };

    const baseProps: Props = {
        channel,
        currentUserIsChannelAdmin: false,
        membersCount: 2,
        searchTerms: '',
        canGoBack: false,
        teamUrl: '/team',
        channelMembers: [adminMember, regularMember],
        channelGroups: [],
        canManageMembers: false,
        editing: false,
        pendingGuests: {},
        actions: defaultActions,
        isGuestUser: false,
    };

    const initialState = {
        entities: {
            general: {
                config: {},
                license: {},
            },
            channels: {
                channels: {
                    ch1: channel,
                },
                roles: {
                    ch1: new Set<string>(),
                },
                membersInChannel: {
                    ch1: {
                        admin1: adminMember.membership,
                        user1: regularMember.membership,
                    },
                },
                myMembers: {
                    ch1: adminMember.membership,
                },
                stats: {
                    ch1: {member_count: 2, guest_count: 0, pinnedpost_count: 0, files_count: 0},
                },
                channelMemberCountsByGroup: {},
            },
            teams: {
                currentTeamId: 'team1',
                teams: {
                    team1: TestHelper.getTeamMock({id: 'team1'}),
                },
                myMembers: {
                    team1: TestHelper.getTeamMembershipMock({team_id: 'team1', roles: ''}),
                },
            },
            users: {
                currentUserId: 'admin1',
                profiles: {
                    admin1: adminUser,
                    user1: regularUser,
                },
                statuses: {
                    admin1: 'online',
                    user1: 'online',
                },
            },
            preferences: {
                myPreferences: {},
            },
            groups: {
                groups: {},
                myGroups: [],
            },
            roles: {
                roles: {},
            },
        },
        views: {
            rhs: {
                editChannelMembers: false,
            },
        },
    };

    it('should display groups section between admins and members when groups exist', () => {
        const props: Props = {
            ...baseProps,
            channelGroups: [mockGroup1, mockGroup2],
        };

        renderWithContext(<ChannelMembersRHS {...props}/>, initialState);

        expect(screen.getByText('TEAMS')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('should not display groups section when there are no groups', () => {
        renderWithContext(<ChannelMembersRHS {...baseProps}/>, initialState);

        expect(screen.queryByText('TEAMS')).not.toBeInTheDocument();
    });

    it('should display member count for each group', () => {
        const props: Props = {
            ...baseProps,
            channelGroups: [mockGroup1],
        };

        renderWithContext(<ChannelMembersRHS {...props}/>, initialState);

        expect(screen.getByText('9 members')).toBeInTheDocument();
    });

    it('should preserve admins and members sections when groups are present', () => {
        const props: Props = {
            ...baseProps,
            channelGroups: [mockGroup1],
        };

        renderWithContext(<ChannelMembersRHS {...props}/>, initialState);

        expect(screen.getByText('CHANNEL ADMINS')).toBeInTheDocument();
        expect(screen.getByText('MEMBERS')).toBeInTheDocument();
        expect(screen.getByText('TEAMS')).toBeInTheDocument();
    });

    it('should preserve admins and members sections when no groups are present', () => {
        renderWithContext(<ChannelMembersRHS {...baseProps}/>, initialState);

        expect(screen.getByText('CHANNEL ADMINS')).toBeInTheDocument();
        expect(screen.getByText('MEMBERS')).toBeInTheDocument();
        expect(screen.queryByText('TEAMS')).not.toBeInTheDocument();
    });

    it('should call fetchChannelGroups on mount', () => {
        const actions = {...defaultActions, fetchChannelGroups: jest.fn()};
        const props: Props = {...baseProps, actions};

        renderWithContext(<ChannelMembersRHS {...props}/>, initialState);

        expect(actions.fetchChannelGroups).toHaveBeenCalledWith('ch1');
    });
});
