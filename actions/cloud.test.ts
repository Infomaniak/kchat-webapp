// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import mockStore from 'tests/test_store';

import {ClientError} from '@mattermost/client';
import {General} from 'mattermost-redux/constants';
import {ModalIdentifiers} from 'utils/constants';

import ChannelLimitReachedModal from 'components/limits/channel_limit_reached_modal';
import ExternalLimitReachedModal from 'components/limits/external_limit_reached_modal';

import {openChannelLimitModalIfNeeded, openExternalLimitModalIfNeeded} from 'actions/cloud';
import {closeModal, openModal} from 'actions/views/modals';

jest.mock('actions/views/modals', () => ({
    openModal: jest.fn(() => ({type: ''})),
    closeModal: jest.fn(() => ({type: ''})),
}));

describe('Limit modals', () => {
    let store;
    const initialState = {
        views: {
            modals: {
                modalState: {
                    [ModalIdentifiers.NEW_CHANNEL_MODAL]: {
                        open: true,
                    },
                    [ModalIdentifiers.INVITATION]: {
                        open: true,
                    },
                },
            },
        },
    };

    describe('Channels Limit', () => {
        it('should display channel limit modal if needed', () => {
            store = mockStore(initialState);
            store.dispatch(openChannelLimitModalIfNeeded(new ClientError('', {
                status_code: 409,
                server_error_id: 'quota-exceeded',
                url: '',
                message: '',
            }), General.OPEN_CHANNEL));
            expect(openModal).toHaveBeenCalledTimes(1);
            expect(openModal).toHaveBeenCalledWith({
                modalId: ModalIdentifiers.CHANNEL_LIMIT_REACHED,
                dialogType: ChannelLimitReachedModal,
                dialogProps: {
                    isPublicLimited: true,
                    isPrivateLimited: false,
                },
            });
        });
        it('should not display channel limit modal if not needed', () => {
            store = mockStore(initialState);
            store.dispatch(openChannelLimitModalIfNeeded(new ClientError('', {
                status_code: 404,
                server_error_id: 'another-error-id',
                url: '',
                message: '',
            }), General.OPEN_CHANNEL));
            expect(openModal).toHaveBeenCalledTimes(0);
        });
        it('should close channel creation modal if opened', () => {
            store = mockStore(initialState);
            store.dispatch(openChannelLimitModalIfNeeded(new ClientError('', {
                status_code: 409,
                server_error_id: 'quota-exceeded',
                url: '',
                message: '',
            }), General.OPEN_CHANNEL));
            expect(closeModal).toHaveBeenCalledTimes(1);
            expect(closeModal).toHaveBeenCalledWith(ModalIdentifiers.NEW_CHANNEL_MODAL);
        });
        it('should not close channel creation modal if closed', () => {
            store = mockStore({
                views: {
                    modals: {
                        modalState: {},
                    },
                },
            });
            store.dispatch(openChannelLimitModalIfNeeded(new ClientError('', {
                status_code: 409,
                server_error_id: 'quota-exceeded',
                url: '',
                message: '',
            }), General.OPEN_CHANNEL));
            expect(closeModal).toHaveBeenCalledTimes(0);
        });
        describe('should trigger modal with expected limitation', () => {
            test('public', () => {
                store = mockStore(initialState);
                store.dispatch(openChannelLimitModalIfNeeded(new ClientError('', {
                    status_code: 409,
                    server_error_id: 'quota-exceeded',
                    url: '',
                    message: '',
                }), General.OPEN_CHANNEL));
                expect(openModal).toHaveBeenCalledTimes(1);
                expect(openModal).toBeCalledWith({
                    modalId: ModalIdentifiers.CHANNEL_LIMIT_REACHED,
                    dialogType: ChannelLimitReachedModal,
                    dialogProps: {
                        isPublicLimited: true,
                        isPrivateLimited: false,
                    },
                });
            });
            test('private', () => {
                store = mockStore(initialState);
                store.dispatch(openChannelLimitModalIfNeeded(new ClientError('', {
                    status_code: 409,
                    server_error_id: 'quota-exceeded',
                    url: '',
                    message: '',
                }), General.PRIVATE_CHANNEL));
                expect(openModal).toHaveBeenCalledTimes(1);
                expect(openModal).toBeCalledWith({
                    modalId: ModalIdentifiers.CHANNEL_LIMIT_REACHED,
                    dialogType: ChannelLimitReachedModal,
                    dialogProps: {
                        isPublicLimited: false,
                        isPrivateLimited: true,
                    },
                });
            });
        });
    });
    describe('Externals Limit', () => {
        it('should display external limit modal if needed', () => {
            store = mockStore(initialState);
            store.dispatch(openExternalLimitModalIfNeeded(new ClientError('', {
                status_code: 409,
                server_error_id: 'quota-exceeded',
                url: '',
                message: '',
            })));
            expect(openModal).toHaveBeenCalledTimes(1);
            expect(openModal).toHaveBeenCalledWith({
                modalId: ModalIdentifiers.EXTERNAL_LIMIT_REACHED,
                dialogType: ExternalLimitReachedModal,
            });
        });
        it('should not display channel limit modal if not needed', () => {
            store = mockStore(initialState);
            store.dispatch(openExternalLimitModalIfNeeded(new ClientError('', {
                status_code: 404,
                server_error_id: 'another-error-id',
                url: '',
                message: '',
            })));
            expect(openModal).toHaveBeenCalledTimes(0);
        });
        it('should close channel creation modal if opened', () => {
            store = mockStore(initialState);
            store.dispatch(openExternalLimitModalIfNeeded(new ClientError('', {
                status_code: 409,
                server_error_id: 'quota-exceeded',
                url: '',
                message: '',
            })));
            expect(closeModal).toHaveBeenCalledTimes(1);
            expect(closeModal).toHaveBeenCalledWith(ModalIdentifiers.INVITATION);
        });
        it('should not close channel creation modal if closed', () => {
            store = mockStore({
                views: {
                    modals: {
                        modalState: {},
                    },
                },
            });
            store.dispatch(openExternalLimitModalIfNeeded(new ClientError('', {
                status_code: 409,
                server_error_id: 'quota-exceeded',
                url: '',
                message: '',
            })));
            expect(closeModal).toHaveBeenCalledTimes(0);
        });
    });
});
