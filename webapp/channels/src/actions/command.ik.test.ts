
import Constants from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import configureStore from 'tests/test_store';

import {executeCommand} from './command';

jest.mock('mattermost-redux/selectors/entities/groups', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/groups'),
    isCurrentUserInChannelGroup: jest.fn(),
}));

jest.mock('actions/views/channel', () => ({
    ...jest.requireActual('actions/views/channel'),
    requestLeaveChannel: jest.fn(() => async () => ({data: undefined})),
}));

const {isCurrentUserInChannelGroup} = require('mattermost-redux/selectors/entities/groups');

describe('executeCommand /leave group blocking', () => {
    const channel = TestHelper.getChannelMock({
        id: 'ch1',
        type: Constants.OPEN_CHANNEL as 'O',
        name: 'test-channel',
        team_id: 'team1',
    });

    const initialState = {
        entities: {
            general: {config: {}, license: {}},
            channels: {
                channels: {ch1: channel},
                currentChannelId: 'ch1',
                myMembers: {ch1: {channel_id: 'ch1', user_id: 'user1', roles: ''}},
                roles: {},
                stats: {ch1: {member_count: 2}},
                channelMemberCountsByGroup: {},
            },
            channelCategories: {
                byId: {},
                orderByTeam: {},
            },
            teams: {
                currentTeamId: 'team1',
                teams: {team1: TestHelper.getTeamMock({id: 'team1'})},
                myMembers: {team1: TestHelper.getTeamMembershipMock({team_id: 'team1', roles: ''})},
            },
            users: {currentUserId: 'user1', profiles: {user1: TestHelper.getUserMock({id: 'user1'})}},
            preferences: {myPreferences: {}},
            groups: {groups: {}, myGroups: []},
            roles: {roles: {}},
            apps: {main: {bindings: []}, rhs: {bindings: []}, pluginEnabled: false},
        },
        views: {
            modals: {modalState: {}},
        },
    };

    it('should return frontendHandled true when user is in channel group', async () => {
        isCurrentUserInChannelGroup.mockReturnValue(true);

        const store = configureStore(initialState);
        const result = await store.dispatch(executeCommand('/leave', {channel_id: 'ch1', team_id: 'team1', root_id: ''}));

        expect(result.data?.frontendHandled).toBe(true);
    });

    it('should proceed with leave when user is not in channel group', async () => {
        isCurrentUserInChannelGroup.mockReturnValue(false);

        const store = configureStore(initialState);
        const result = await store.dispatch(executeCommand('/leave', {channel_id: 'ch1', team_id: 'team1', root_id: ''}));

        expect(result.data?.frontendHandled).toBe(true);
    });
});
