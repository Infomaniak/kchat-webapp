// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ReactWrapper} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';

import {General} from 'mattermost-redux/constants';

import {redirectTokSuiteDashboard} from 'actions/global_actions';

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
                        account_id: 'current_team_account_id',
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
            const setLimitations = jest.fn();
            let wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.OPEN_CHANNEL}
                        setLimitations={setLimitations}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(true);
            wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.PRIVATE_CHANNEL}
                        setLimitations={setLimitations}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(false);
            expect(setLimitations).toHaveBeenCalledTimes(2);
            expect(setLimitations).toHaveBeenCalledWith({
                [General.OPEN_CHANNEL]: true,
                [General.PRIVATE_CHANNEL]: false,
            });
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
            const setLimitations = jest.fn();
            let wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.PRIVATE_CHANNEL}
                        setLimitations={setLimitations}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(true);
            wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.OPEN_CHANNEL}
                        setLimitations={setLimitations}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(false);
            expect(setLimitations).toHaveBeenCalledTimes(2);
            expect(setLimitations).toHaveBeenCalledWith({
                [General.OPEN_CHANNEL]: false,
                [General.PRIVATE_CHANNEL]: true,
            });
        });
        test('not limited', async () => {
            store = mockStore({...initialState});
            const setLimitations = jest.fn();
            let wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.OPEN_CHANNEL}
                        setLimitations={setLimitations}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(false);
            wrapper = mountWithIntl(
                <Provider store={store}>
                    <ChannelLimitIndicator
                        type={General.PRIVATE_CHANNEL}
                        setLimitations={setLimitations}
                    />
                </Provider>,
            );
            await actImmediate(wrapper);
            expect(wrapper.find('.channel-limit-indicator').exists()).toBe(false);
            expect(setLimitations).toHaveBeenCalledTimes(2);
            expect(setLimitations).toHaveBeenCalledWith({
                [General.OPEN_CHANNEL]: false,
                [General.PRIVATE_CHANNEL]: false,
            });
        });
    });
    it('should redirect to ksuite manager', async () => {
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
                    setLimitations={jest.fn()}
                />
            </Provider>,
        );
        await actImmediate(wrapper);
        const modifyOffer = wrapper.find('a');
        expect(modifyOffer.exists()).toBe(true);
        modifyOffer.simulate('click');
        expect(redirectTokSuiteDashboard).toHaveBeenCalledTimes(1);
        expect(redirectTokSuiteDashboard).toHaveBeenCalledWith('current_team_account_id');
    });
});
