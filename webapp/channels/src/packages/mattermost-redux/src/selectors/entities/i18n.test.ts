// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from '@mattermost/types/store';

import * as Selectors from 'mattermost-redux/selectors/entities/i18n';

import TestHelper from '../../../test/test_helper';

describe('Selectors.I18n', () => {
    describe('getCurrentUserLocale', () => {
        it('not logged in', () => {
            const state = {
                entities: {
                    users: {
                        currentUserId: '',
                        profiles: {},
                    },
                },
            } as unknown as GlobalState;

            expect(Selectors.getCurrentUserLocale(state, 'default')).toEqual('default');
        });

        it('current user not loaded', () => {
            const currentUserId = TestHelper.generateId();
            const state = {
                entities: {
                    users: {
                        currentUserId,
                        profiles: {},
                    },
                },
            } as unknown as GlobalState;

            expect(Selectors.getCurrentUserLocale(state, 'default')).toEqual('default');
        });

        it('current user without locale set', () => {
            const currentUserId = TestHelper.generateId();
            const state = {
                entities: {
                    users: {
                        currentUserId,
                        profiles: {
                            [currentUserId]: {locale: ''},
                        },
                    },
                },
            } as unknown as GlobalState;

            expect(Selectors.getCurrentUserLocale(state, 'default')).toEqual('default');
        });

        it('current user with locale set', () => {
            const currentUserId = TestHelper.generateId();
            const state = {
                entities: {
                    users: {
                        currentUserId,
                        profiles: {
                            [currentUserId]: {locale: 'fr'},
                        },
                    },
                },
            } as unknown as GlobalState;

            expect(Selectors.getCurrentUserLocale(state, 'default')).toEqual('fr');
        });
    });
});
