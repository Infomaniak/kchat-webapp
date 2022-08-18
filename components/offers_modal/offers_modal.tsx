// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';

import GenericModal from 'components/generic_modal';
import OffersFoldersSvg from 'components/common/svg_images_components/offers_folders_svg';

import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';

import './offers_modal.scss';

type Props = {
    onExited?: () => void;
}

const OffersModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const dispatch = useDispatch<DispatchFunc>();

    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.OFFERS));
    if (!show) {
        return null;
    }

    const handleOnClose = () => {
        if (props.onExited) {
            props.onExited();
        }
        dispatch(closeModal(ModalIdentifiers.OFFERS));
    };

    const handleAccept = () => {
        window.open('https://www.youtube.com/watch?v=xvFZjo5PgG0', '_blank')?.focus();
        dispatch(closeModal(ModalIdentifiers.OFFERS));
    };

    return (
        <GenericModal
            className={'ConfirmLicenseRemovalModal'}
            show={show}
            id='ConfirmLicenseRemovalModal'
            onExited={handleOnClose}
        >
            <>
                <div className='content-body'>
                    <div className='folders-svg'>
                        <OffersFoldersSvg
                            width={196}
                            height={81}
                        />
                    </div>
                    <div className='title'>
                        <FormattedMessage
                            id='place.holder'
                            defaultMessage='Augmentez l’espace de stockage de votre kSuite !'
                        />
                    </div>
                    <div className='subtitle'>
                        <FormattedMessage
                            id='place.holder'
                            defaultMessage='Votre espace de stockage est plein. Débloquez plus d’applications, de fonctionnalités en boostant votre espace de stockage et optimisez le travail en collaboration avec kDrive, kChat... Souscrivez à une offre supérieure pour envoyer de nouveaux fichiers sur kChat et kDrive.'
                        />
                        <p className='modify-link'>
                            <a href='https://www.youtube.com/watch?v=xvFZjo5PgG0'>
                                <FormattedMessage
                                    id='place.holder'
                                    defaultMessage='En savoir plus'
                                />
                            </a>
                        </p>
                    </div>
                </div>
                <div className='content-footer'>
                    <button
                        onClick={handleOnClose}
                        className='btn light-blue-btn'
                        id='cancel-offer'
                    >
                        <FormattedMessage
                            id='place.holder'
                            defaultMessage='Pas pour le moment'
                        />
                    </button>
                    <button
                        onClick={handleAccept}
                        className='btn btn-primary'
                        id='modify-offer'
                    >
                        <FormattedMessage
                            id='place.holder'
                            defaultMessage='Modifier mon offre'
                        />
                    </button>
                </div>
            </>
        </GenericModal>
    );
};

export default OffersModal;
