// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentTeamAccountId} from 'mattermost-redux/selectors/entities/teams';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {getUsage} from 'actions/cloud';
import {redirectTokSuiteDashboard} from 'actions/global_actions';
import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import {GenericModal} from '@mattermost/components';
import ChannelLimitReachedIcon from 'components/widgets/icons/channel_limit_reached_icon';

import {ModalIdentifiers} from 'utils/constants';

import type {GlobalState} from 'types/store';

import '../limit_modal.scss';

type Props = {
    isPublicLimited?: boolean;
    isPrivateLimited?: boolean;
};

const ChannelLimitReachedModal = ({isPublicLimited, isPrivateLimited}: Props) => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const isAdmin = useSelector((state: GlobalState) => isCurrentUserSystemAdmin(state));
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CHANNEL_LIMIT_REACHED));
    const currentTeamAccountId = useSelector(getCurrentTeamAccountId);

    const [limits, limitsLoaded] = useGetLimits();
    const {public_channels: publicChannelLimit, private_channels: privateChannelLimit} = limits;
    const {public_channels: publicChannelUsage, private_channels: privateChannelUsage, usageLoaded} = useGetUsage();

    useEffect(() => {
        dispatch(getUsage());
    }, [dispatch]);

    const handleClose = useCallback(() => {
        dispatch(closeModal(ModalIdentifiers.CHANNEL_LIMIT_REACHED));
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
            <div>
                {formatMessage({
                    id: 'channelLimit.subtitle',
                    defaultMessage: 'You have reached the limit of <bold>{isPublicLimited, select, true {public channels ({publicChannelUsage, number}/{publicChannelLimit, number}) {isPrivateLimited, select, true {and} other {}}} other {}} {isPrivateLimited, select, true {private channels ({privateChannelUsage, number}/{privateChannelLimit, number})} other {}}</bold> on your kChat. To create additional ones, you need to subscribe to a premium package.',
                }, {
                    isPublicLimited,
                    isPrivateLimited,
                    publicChannelUsage,
                    publicChannelLimit,
                    privateChannelUsage,
                    privateChannelLimit,
                    bold: (chunks) => (<b>{chunks}</b>),
                })}
            </div>
        </div>
    );

    const confirmButtonText = isAdmin ? formatMessage({id: 'limitModal.upgrade', defaultMessage: 'Modify my offer'}) : formatMessage({id: 'general_button.close', defaultMessage: 'Close'});

    if (!usageLoaded || !limitsLoaded || (!isPublicLimited && !isPrivateLimited)) {
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
