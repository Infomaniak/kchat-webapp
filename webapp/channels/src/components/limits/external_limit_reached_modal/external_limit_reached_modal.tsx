// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {GenericModal} from '@mattermost/components';

import {getCurrentTeamAccountId} from 'mattermost-redux/selectors/entities/teams';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {getUsage} from 'actions/cloud';
import {redirectTokSuiteDashboard} from 'actions/global_actions';
import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import ExternalLimitReachedIcon from 'components/widgets/icons/external_limit_reached_icon';

import {ModalIdentifiers} from 'utils/constants';

import type {GlobalState} from 'types/store';

import '../limit_modal.scss';

const ExternalLimitReachedModal = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.EXTERNAL_LIMIT_REACHED));
    const currentTeamAccountId = useSelector(getCurrentTeamAccountId);

    const [limits, limitsLoaded] = useGetLimits();
    const {guests: externalsLimit} = limits;
    const {guests: externalsUsage, pending_guests: pendingGuestsUsage, usageLoaded} = useGetUsage();

    useEffect(() => {
        dispatch(getUsage());
    }, [dispatch]);

    const handleClose = useCallback(() => {
        dispatch(closeModal(ModalIdentifiers.EXTERNAL_LIMIT_REACHED));
    }, [dispatch]);

    const handleConfirm = useCallback(() => {
        if (isAdmin) {
            redirectTokSuiteDashboard(currentTeamAccountId);
        }
    }, [isAdmin, currentTeamAccountId]);

    let handleCancel;
    if (isAdmin) {
        handleCancel = handleClose;
    }

    const header = (
        <div className='limit-modal-header'>
            <div className='limit-modal-header__icon'>
                <ExternalLimitReachedIcon/>
            </div>
            <div className='limit-modal-header__title'>
                {formatMessage({
                    id: 'externalLimit.title',
                    defaultMessage: 'Communicate better with people outside your organization',
                })}
            </div>
        </div>
    );

    const content = (
        <div className='limit-modal-content'>
            {formatMessage({
                id: 'externalLimit.subtitle',
                defaultMessage: 'You have reached the limit of external users ({externalsUsage, number}/{externalsLimit, number}{pendingGuestsUsage, select, 0 {} other { including {pendingGuestsUsage, number} pending {pendingGuestsUsage, plural, =0 {} one {invitation} other {invitations}}}}) on your kChat. To invite additional users, you must subscribe to a higher plan.',
            }, {
                externalsUsage: externalsUsage + pendingGuestsUsage,
                externalsLimit,
                pendingGuestsUsage,
            })}
        </div>
    );

    const confirmButtonText = isAdmin ? formatMessage({id: 'limitModal.upgrade', defaultMessage: 'Modify my offer'}) : formatMessage({id: 'general_button.close', defaultMessage: 'Close'});

    if (!limitsLoaded || !usageLoaded) {
        handleClose();
        return null;
    }

    return (
        <GenericModal
            className='limit-modal'
            id='ExternalLimitReachedModal'
            modalHeaderText={header}
            onExited={handleClose}
            handleCancel={handleCancel}
            handleConfirm={handleConfirm}
            confirmButtonText={confirmButtonText}
            show={show}
        >
            {content}
        </GenericModal>
    );
};

export default ExternalLimitReachedModal;
