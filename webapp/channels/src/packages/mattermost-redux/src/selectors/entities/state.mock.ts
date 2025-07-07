import {TestHelper} from '../../../../../utils/test_helper';

export const StateEntitiesUsersMock = {
    currentUserId: 'uid',
    profiles: {
        1: {
            id: '1',
            username: 'first.last1',
            nickname: 'nickname1',
            first_name: 'First1',
            last_name: 'Last1',
        },
        2: {
            id: '2',
            username: 'first.last2',
            nickname: 'nickname2',
            first_name: 'First2',
            last_name: 'Last2',
        },
        3: {
            id: '3',
            username: 'first.last3',
            nickname: 'nickname3',
            first_name: 'First3',
            last_name: 'Last3',
        },
        4: {
            id: '4',
            username: 'first.last4',
            nickname: 'nickname4',
            first_name: 'First4',
            last_name: 'Last4',
        },
        5: {
            id: '5',
            username: 'first.last5',
            nickname: 'nickname5',
            first_name: 'First5',
            last_name: 'Last5',
        },
    },
    statuses: {},
};

export const StateEntitiesChannelsMock = {
    membersInChannel: {},
    currentChannelId: 'current_channel_id',
    myMembers: {
        current_channel_id: {
            channel_id: 'current_channel_id',
            user_id: 'current_user_id',
            roles: 'channel_role',
            mention_count: 1,
            msg_count: 9,
        },
    },
    channels: {
        current_channel_id: TestHelper.getChannelMock({
            id: 'current_channel_id',
            name: 'default-name',
            display_name: 'Default',
            delete_at: 0,
            type: 'O',
            team_id: 'team_id',
        }),
        current_user_id__existingId: TestHelper.getChannelMock({
            id: 'current_user_id__existingId',
            name: 'current_user_id__existingId',
            display_name: 'Default',
            delete_at: 0,
            type: 'O',
            team_id: 'team_id',
        }),
    },
    channelsInTeam: {
        'team-id': new Set(['asdf']),
    },
    messageCounts: {
        current_channel_id: {total: 10},
        current_user_id__existingId: {total: 0},
    },
};

export const StateEntitiesPostsMock = {
    posts: {
        postthreadid: {
            id: 'postthreadid',
            reply_count: 9,
            last_reply_at: 1554161504000,
            is_following: true,
            channel_id: 'cid',
            user_id: '1',
        },
        singlemessageid: {
            id: 'singlemessageid',
            reply_count: 0,
            last_reply_at: 0,
            is_following: true,
            channel_id: 'cid',
            user_id: '1',
        },
    },
};

export const StateViewRhsMock = {
    rhsState: null,
    filesSearchExtFilter: [] as string[],
    searchType: '',
};

export const StateViewModalsMock = {
    modalState: {
        1: {
            open: false,
        },
    },
};

export const StateEntitiesTeamsMock = {
    membersInTeam: {},
    currentTeamId: 'tid',
    teams: {
        tid: {
            id: 'tid',
            name: 'team1',
        },
    },
};

