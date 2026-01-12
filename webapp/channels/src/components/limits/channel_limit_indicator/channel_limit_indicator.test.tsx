// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ReactWrapper} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';

import {General} from 'mattermost-redux/constants';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import mockStore from 'tests/test_store';

import ChannelLimitIndicator from './channel_limit_indicator';

jest.mock('actions/global_actions', () => ({
    redirectTokSuiteDashboard: jest.fn(),
}));

jest.mock('actions/cloud', () => ({
    getUsage: () => {
        return () => Promise.resolve({data: true});
    },
}));

const actImmediate = (wrapper: ReactWrapper) =>
    act(
        () =>
            new Promise<void>((resolve) => {
                setImmediate(() => {
                    wrapper.update();
                    resolve();
                });
            }),
    );

describe('channel limit indicator', () => {
    let store;
    const initialState = {
        entities: {
            teams: {
                currentTeamId: 'current_team_id',
                teams: {
                    current_team_id: {
                        id: 'current_team_id',
                        account_id: 0,
                    },
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_admin'},
                },
            },
            roles: {
                roles: {
                    system_admin: {
                        permissions: [],
                    },
                },
            },
            usage: {
                storage: 0,
                public_channels: 0,
                private_channels: 0,
                guests: 0,
                members: 0,
                files: {
                    totalStorage: 0,
                },
                messages: {
                    history: 0,
                },
                teams: {
                    active: 0,
                    cloudArchived: 0,
                },
                boards: {
                    cards: 0,
                },
                usageLoaded: true,
            },
            cloud: {
                limits: {
                    limits: {
                        storage: 10,
                        public_channels: 10,
                        private_channels: 10,
                        guests: 10,
                        members: 10,
                    },
                    limitsLoaded: true,
                },
            },
        },
    };
    describe('visibility', () => {
        test('public limited', async () => {
            store = mockStore({
                ...initialState,
                entities: {
                    ...initialState.entities,
                    usage: {
                        ...initialState.entities.usage,
                        public_channels: 10,
                    },
                },
            });
            let wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.OPEN_CHANNEL}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(true);
            wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.PRIVATE_CHANNEL}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(false);
        });
        test('private limited', async () => {
            store = mockStore({
                ...initialState,
                entities: {
                    ...initialState.entities,
                    usage: {
                        ...initialState.entities.usage,
                        private_channels: 10,
                    },
                },
            });
            let wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.PRIVATE_CHANNEL}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(true);
            wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.OPEN_CHANNEL}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(false);
        });
        test('not limited', async () => {
            store = mockStore({...initialState});
            let wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.OPEN_CHANNEL}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(false);
            wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.PRIVATE_CHANNEL}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(false);
        });
    });
    it('should show the upgrade trigger', async () => {
        store = mockStore({
            ...initialState,
            entities: {
                ...initialState.entities,
                usage: {
                    ...initialState.entities.usage,
                    public_channels: 10,
                },
            },
        });
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <ChannelLimitIndicator
                    type={General.OPEN_CHANNEL}
                />
            </Provider>,
        );
        await actImmediate(wrapper);
        const link = wrapper.find('.channel-limit-indicator__trigger-upgrade');
        expect(link.exists()).toBe(true);
        expect(link.text()).toBe('Upgrade');
        expect(link.prop('slot')).toBe('trigger-element');
    });
});
