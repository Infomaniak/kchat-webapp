// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';

import GenericModal from 'components/generic_modal';
import Header from 'components/widgets/header';
import GetTheAppModalIcon from 'components/widgets/icons/get_the_app_modal_icon';
import useGetOperatingSystem from 'components/common/hooks/useGetOperatingSystem';

import {ModalIdentifiers} from 'utils/constants';

import loaderkChat from 'images/logo_compact.png';
import MattermostLogoSvg from 'images/logo.svg';

import {GlobalState} from 'types/store';

import './get_the_app_modal.scss';

type Props = {
    onClose: () => void;
};

const GetTheAppModal = ({onClose}: Props) => {
    const dispatch = useDispatch();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.GET_THE_APP));
    const {formatMessage} = useIntl();
    const platform = useGetOperatingSystem();

    const handleClose = () => {
        dispatch(closeModal(ModalIdentifiers.GET_THE_APP));
        onClose();
    };

    const onExited = () => handleClose();

    const handleConfirm = () => {
        window.open('https://infomaniak.com/gtl/apps.kchat?appredirect=true', '_blank', 'noopener,noreferrer');
        handleClose();
    };

    const content = (
        <div className='get-the-app-modal-content'>
            <GetTheAppModalIcon className='get-the-app-modal-content__icon'/>
            <Header
                className='get-the-app-modal-content__content'
                level={2}
                heading={formatMessage({
                    id: 'get_the_app_modal.header',
                    defaultMessage: 'Download the kChat application for {platform}',
                }, {
                    platform,
                })}
                subtitle={formatMessage({
                    id: 'get_the_app_modal.content',
                    defaultMessage: 'We advise you to install the application to have a better experience !',
                })}
            />
        </div>
    );

    const confirmButtonText = formatMessage({
        id: 'get_the_app_modal.confirm',
        defaultMessage: 'Download kChat for {platform}',
    }, {
        platform,
    });

    const modalHeaderText = (
        <div className='get-the-app-modal-header'>
            <img
                className='get-the-app-modal-header__logo'
                src={loaderkChat}
                alt='kchat logo'
            />
            <div className='get-the-app-modal-header__title'>
                <img
                    className='get-the-app-header__ik-logo'
                    src={MattermostLogoSvg}
                    alt='infomaniak logo'
                />
                {'kChat'}
            </div>
        </div>
    );

    return (
        <GenericModal
            className='get-the-app-modal'
            id='GetTheAppModal'
            show={show}
            onExited={onExited}
            handleConfirm={handleConfirm}
            confirmButtonText={confirmButtonText}
            modalHeaderText={modalHeaderText}
        >
            {content}
        </GenericModal>
    );
};

export default GetTheAppModal;
