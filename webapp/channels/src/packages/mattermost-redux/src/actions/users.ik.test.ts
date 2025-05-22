// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import nock from 'nock';

import * as Actions from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';

import TestHelper from '../../test/test_helper';
import configureStore from '../../test/test_store';

describe('Actions.Users', () => {
    let store = configureStore();

    beforeAll(() => {
        TestHelper.initBasic(Client4);
    });

    beforeEach(() => {
        store = configureStore({
            entities: {
                general: {
                    config: {},
                },

                // Infomaniak specific mock
                ksuiteBridge: {
                    bridge: {
                        isConnected: false,
                    },
                },
            },

        });

        Client4.setUserId('');
        Client4.setUserRoles('');
    });

    afterEach(() => {
        nock.cleanAll();
    });

    afterAll(() => {
        TestHelper.tearDown();
    });

    it('getProfiles get all profiles pages', async () => {
        const page1 = [{id: 'user1'}, {id: 'user2'}];
        const page2 = [{id: 'user3'}];

        const perPage = 2;

        nock(Client4.getBaseRoute()).
            get('/users').
            query((queryObj) => queryObj.page === '0' && queryObj.per_page === String(perPage)).
            reply(200, page1);

        nock(Client4.getBaseRoute()).
            get('/users').
            query((queryObj) => queryObj.page === '1' && queryObj.per_page === String(perPage)).
            reply(200, page2);

        await store.dispatch(Actions.getProfiles(0, perPage));

        const {profiles} = store.getState().entities.users;

        expect(profiles).toHaveProperty('user1');
        expect(profiles).toHaveProperty('user2');
        expect(profiles).toHaveProperty('user3');
    });
});
