// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {closeModal} from 'actions/views/modals';
import {redirectTokSuiteDashboard} from 'actions/global_actions';
import {getUsage} from 'actions/cloud';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {ModalIdentifiers} from 'utils/constants';

import GenericModal from 'components/generic_modal';
import ChannelLimitReachedIcon from 'components/widgets/icons/channel_limit_reached_icon';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetLimits from 'components/common/hooks/useGetLimits';

import '../limit_modal.scss';

const ChannelLimitReachedModal = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const isAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CHANNEL_LIMIT_REACHED));

    const [limits, limitsLoaded] = useGetLimits();
    const {public_channels: publicChannelLimit, private_channels: privateChannelLimit} = limits;
    const {public_channels: publicChannelUsage, private_channels: privateChannelUsage, usageLoaded} = useGetUsage();

    useEffect(() => {
        dispatch(getUsage());
    }, []);

    const handleClose = useCallback(() => {
        dispatch(closeModal(ModalIdentifiers.CHANNEL_LIMIT_REACHED));
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
                <ChannelLimitReachedIcon/>
            </div>
            <div className='limit-modal-header__title'>
                {formatMessage({
                    id: 'channelLimit.title',
                    defaultMessage: 'Create new channels to better communicate with your organization’s members',
                })}
            </div>
        </div>
    );

    const content = (
        <div className='limit-modal-content'>
            {formatMessage({
                id: 'channelLimit.subtitle',
                defaultMessage: 'You have reached the limit of public channels ({publicChannelUsage, number}/{publicChannelLimit, number}) and private channels ({privateChannelUsage, number}/{privateChannelLimit, number}) on your kChat. To create additional ones, you need to subscribe to a premium package.',
            }, {
                publicChannelUsage,
                publicChannelLimit,
                privateChannelUsage,
                privateChannelLimit,
            })}
        </div>
    );

    const confirmButtonText = isAdmin ? formatMessage({id: 'limitModal.upgrade', defaultMessage: 'Modify my offer'}) : formatMessage({id: 'general_button.close', defaultMessage: 'Close'});

    if (!usageLoaded || !limitsLoaded) {
        handleClose();
        return null;
    }

    return (
        <GenericModal
            className='limit-modal'
            id='ChannelLimitReachedModal'
            show={show}
            onExited={handleClose}
            handleConfirm={handleConfirm}
            handleCancel={handleCancel}
            modalHeaderText={header}
            confirmButtonText={confirmButtonText}
        >
            {content}
        </GenericModal>
    );
};

export default ChannelLimitReachedModal;
