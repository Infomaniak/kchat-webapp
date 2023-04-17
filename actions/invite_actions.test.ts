// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from '@mattermost/types/channels';

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {sendGuestsInvites} from 'actions/invite_actions';
import mockStore from 'tests/test_store';

import {openExternalLimitModalIfNeeded} from 'actions/cloud';

jest.mock('actions/team_actions', () => ({
    addUsersToTeam: () => ({ // since we are using addUsersToTeamGracefully, this call will always succeed
        type: 'MOCK_RECEIVED_ME',
    }),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    joinChannel: (_userId: string, _teamId: string, channelId: string, _channelName: string) => {
        if (channelId === 'correct') {
            return ({type: 'MOCK_RECEIVED_ME'});
        }
        if (channelId === 'correct2') {
            return ({type: 'MOCK_RECEIVED_ME'});
        }
        throw new Error('ERROR');
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getChannelMembersByIds: (channelId: string, userIds: string[]) => {
        return ({type: 'MOCK_RECEIVED_CHANNEL_MEMBERS'});
    },
}));

jest.mock('mattermost-redux/actions/teams', () => ({
    getTeamMembersByIds: () => ({type: 'MOCK_RECEIVED_ME'}),
    sendEmailInvitesToTeamGracefully: (team: string, emails: string[]) => {
        if (team === 'incorrect-default-smtp') {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: 'SMTP is not configured in System Console.', id: 'api.team.invite_members.unable_to_send_email_with_defaults.app_error'}}))});
        } else if (emails.length > 21) { // Poor attempt to mock rate limiting.
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: 'Invite emails rate limit exceeded.'}}))});
        } else if (team === 'error') {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: 'Unable to add the user to the team.'}}))});
        }

        // team === 'correct' i.e no error
        return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: undefined}))});
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendEmailGuestInvitesToChannelsGracefully: (teamId: string, _channelIds: string[], emails: string[], _message: string) => {
        if (teamId === 'incorrect-default-smtp') {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: 'SMTP is not configured in System Console.', id: 'api.team.invite_members.unable_to_send_email_with_defaults.app_error'}}))});
        } else if (emails.length > 21) { // Poor attempt to mock rate limiting.
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: 'Invite emails rate limit exceeded.'}}))});
        } else if (teamId === 'error') {
            return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: {message: 'Unable to add the guest to the channels.'}}))});
        }

        // teamId === 'correct' i.e no error
        return ({type: 'MOCK_RECEIVED_ME', data: emails.map((email) => ({email, error: undefined}))});
    },
}));

describe('actions/invite_actions', () => {
    const store = mockStore({
        entities: {
            general: {
                config: {
                    DefaultClientLocale: 'en',
                },
            },
            teams: {
                teams: {
                    correct: {id: 'correct'},
                    error: {id: 'error'},
                },
                membersInTeam: {
                    correct: {
                        user1: {id: 'user1'},
                        user2: {id: 'user2'},
                        guest1: {id: 'guest1'},
                        guest2: {id: 'guest2'},
                        guest3: {id: 'guest3'},
                    },
                    error: {
                        user1: {id: 'user1'},
                        user2: {id: 'user2'},
                        guest1: {id: 'guest1'},
                        guest2: {id: 'guest2'},
                        guest3: {id: 'guest3'},
                    },
                },
                myMembers: {},
            },
            channels: {
                myMembers: {},
                channels: {},
                membersInChannel: {
                    correct: {
                        guest2: {id: 'guest2'},
                        guest3: {id: 'guest3'},
                    },
                    correct2: {
                        guest2: {id: 'guest2'},
                    },
                    error: {
                        guest2: {id: 'guest2'},
                        guest3: {id: 'guest3'},
                    },
                },
            },
            users: {
                currentUserId: 'user1',
                profiles: {
                    user1: {
                        roles: 'system_admin',
                    },
                },
            },
        },
        views: {
            rhs: {
                isSidebarOpen: false,
            },
        },
    });

    describe('sendGuestsInvites', () => {
        it('should generate and empty list if nothing is passed', async () => {
            const response = await sendGuestsInvites('correct', [], [], [], '', openExternalLimitModalIfNeeded)(store.dispatch as DispatchFunc, store.getState as GetStateFunc);
            expect(response).toEqual({
                data: {
                    sent: [],
                    notSent: [],
                },
            });
        });

        it('should generate list of success for emails', async () => {
            const channels = [{id: 'correct'}] as Channel[];
            const emails = ['email-one@email-one.com'];
            const response = await sendGuestsInvites('correct', channels, [], emails, 'message', openExternalLimitModalIfNeeded)(store.dispatch as DispatchFunc, store.getState as GetStateFunc);
            expect(response).toEqual({
                data: {
                    notSent: [],
                    sent: [
                        {
                            email: 'email-one@email-one.com',
                            reason: 'An invitation email has been sent.',
                        },
                    ],
                },
            });
        });

        it('should generate list of failures for emails on invite fails', async () => {
            const channels = [{id: 'correct'}] as Channel[];
            const emails = ['email-one@email-one.com'];
            const response = await sendGuestsInvites('error', channels, [], emails, 'message', openExternalLimitModalIfNeeded)(store.dispatch as DispatchFunc, store.getState as GetStateFunc);
            expect(response).toEqual({
                data: {
                    sent: [],
                    notSent: [
                        {
                            email: 'email-one@email-one.com',
                            reason: 'Unable to add the guest to the channels.',
                        },
                    ],
                },
            });
        });
    });
});
