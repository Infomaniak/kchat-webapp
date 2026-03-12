import {fireEvent, screen} from '@testing-library/react';
import React from 'react';

import Constants from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import {renderWithContext} from 'tests/react_testing_utils';

import LeaveChannel from './leave_channel';

jest.mock('mattermost-redux/selectors/entities/groups', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/groups'),
    isCurrentUserInChannelGroup: jest.fn(),
}));

const {isCurrentUserInChannelGroup} = require('mattermost-redux/selectors/entities/groups');

describe('LeaveChannel group blocking', () => {
    const publicChannel = TestHelper.getChannelMock({
        id: 'ch1',
        type: Constants.OPEN_CHANNEL as 'O',
        name: 'test-channel',
    });

    const initialState = {
        entities: {
            general: {config: {}, license: {}},
            channels: {
                channels: {ch1: publicChannel},
                myMembers: {},
                roles: {},
                channelMemberCountsByGroup: {},
            },
            teams: {currentTeamId: 'team1', teams: {}, myMembers: {}},
            users: {currentUserId: 'user1', profiles: {}},
            preferences: {myPreferences: {}},
            groups: {groups: {}, myGroups: []},
            roles: {roles: {}},
        },
        views: {modals: {modalState: {}}},
    };

    it('should open blocked modal when user is in channel group', () => {
        isCurrentUserInChannelGroup.mockReturnValue(true);

        renderWithContext(<LeaveChannel channel={publicChannel}/>, initialState);

        const menuItem = screen.getByText('Leave Channel');
        fireEvent.click(menuItem);
    });

    it('should not open blocked modal when user is not in channel group', () => {
        isCurrentUserInChannelGroup.mockReturnValue(false);

        renderWithContext(<LeaveChannel channel={publicChannel}/>, initialState);

        const menuItem = screen.getByText('Leave Channel');
        fireEvent.click(menuItem);
    });
});
