// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {mount} from 'enzyme';
import React from 'react';
import {IntlProvider} from 'react-intl';
import {Provider} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';

import * as teams from 'mattermost-redux/selectors/entities/teams';

import mockStore from 'tests/test_store';

import AddMembersButton from './add_members_button';

describe('components/post_view/AddMembersButton', () => {
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

    const initialState = {
        entities: {
            teams: {
                currentTeamId: 'team-id',
            },
            users: {
                profiles: {
                    'test-user-id': {
                        id: 'test-user-id',
                        roles: 'system_role',
                    },
                },
            },
            roles: {
                roles: {
                    system_role: {permissions: ['test_system_permission']},
                    team_role: {permissions: ['test_team_permission']},
                    channel_role: {permissions: ['test_channel_permission', 'manage_public_channel_members']},
                },
            },
            channels: {
                roles: {
                    channel_id: ['channel_role'],
                },
            },
        },
    };

    const intlProps = {
        defaultLocale: 'en',
        locale: 'en',
        messages: {testId: 'Actual value'},
    };

    const store = mockStore(initialState);
    jest.spyOn(teams, 'getCurrentTeamId').mockReturnValue('team-id');

    test('should match snapshot, less than limit', () => {
        const props = {
            totalUsers: 10,
            usersLimit: 100,
            channel,
        };
        const wrapper = mount(
            <IntlProvider {...intlProps}>
                <Provider store={store}>
                    <AddMembersButton {...props}/>
                </Provider>
            </IntlProvider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, more than limit', () => {
        const props = {
            totalUsers: 100,
            usersLimit: 10,
            channel,
        };
        const wrapper = mount(
            <IntlProvider {...intlProps}>
                <Provider store={store}>
                    <AddMembersButton {...props}/>
                </Provider>
            </IntlProvider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, setHeader and pluginButtons', () => {
        const pluginButtons = (
            <button>
                {'Create a board'}
            </button>
        );
        const setHeader = (
            <button>
                {'Create a board'}
            </button>
        );
        const props = {
            totalUsers: 100,
            usersLimit: 10,
            channel,
            setHeader,
            pluginButtons,
        };
        const wrapper = mount(
            <IntlProvider {...intlProps}>
                <Provider store={store}>
                    <AddMembersButton {...props}/>
                </Provider>
            </IntlProvider>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
