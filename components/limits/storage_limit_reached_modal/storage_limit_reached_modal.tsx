// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {ModalIdentifiers} from 'utils/constants';

import GenericModal from 'components/generic_modal';
import StorageLimitReachedIcon from 'components/widgets/icons/storage_limit_reached_icon';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';

import {closeModal} from 'actions/views/modals';
import {redirectTokSuiteDashboard} from 'actions/global_actions';
import {GlobalState} from 'types/store';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {isModalOpen} from 'selectors/views/modals';

import '../limit_modal.scss';

const StorageLimitReachedModal = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const isAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.STORAGE_LIMIT_REACHED));

    const [limitsLoaded] = useGetLimits();
    const {usageLoaded} = useGetUsage();

    const handleClose = useCallback(() => {
        dispatch(closeModal(ModalIdentifiers.STORAGE_LIMIT_REACHED));
    }, [dispatch]);

    const handleConfirm = useCallback(() => {
        if (isAdmin) {
            redirectTokSuiteDashboard();
        }
    }, [isAdmin]);

    let handleCancel;
    if (isAdmin) {
        handleCancel = handleClose;
    }

    const header = (
        <div className='limit-modal-header'>
            <div className='limit-modal-header__icon'>
                <StorageLimitReachedIcon/>
            </div>
            <div className='limit-modal-header__title'>
                {formatMessage({
                    id: 'storageLimit.title',
                    defaultMessage: 'Increase the storage space of your kSuite!',
                })}
            </div>
        </div>
    );

    const content = (
        <div className='limit-modal-content'>
            {isAdmin ? (
                formatMessage({
                    id: 'storageLimit.subtitle.admin',
                    defaultMessage: 'Your storage space is full. Sign up for a higher plan to continue sending files.',
                })
            ) : (
                formatMessage({
                    id: 'storageLimit.subtitle',
                    defaultMessage: 'Your storage space is full. To continue uploading files, please contact an administrator to change the offer.',
                })
            )}
        </div>
    );

    const confirmButtonText = isAdmin ? formatMessage({id: 'limitModal.upgrade', defaultMessage: 'Modify my offer'}) : formatMessage({id: 'general_button.close', defaultMessage: 'Close'});

    let cancelButtonText;
    if (isAdmin) {
        cancelButtonText = formatMessage({id: 'Not now', defaultMessage: 'Pas pour le moment'});
    }

    if (!limitsLoaded || !usageLoaded) {
        handleClose();
        return null;
    }

    return (
        <GenericModal
            className='limit-modal'
            id='StorageLimitReachedModal'
            onExited={handleClose}
            handleConfirm={handleConfirm}
            handleCancel={handleCancel}
            modalHeaderText={header}
            confirmButtonText={confirmButtonText}
            cancelButtonText={cancelButtonText}
            show={show}
        >
            {content}
        </GenericModal>
    );
};

export default StorageLimitReachedModal;
