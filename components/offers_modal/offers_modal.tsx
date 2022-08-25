// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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

const LEARN_MORE_LINK = 'https://www.youtube.com/watch?v=xvFZjo5PgG0';
const MODIFY_OFFER_LINK = 'https://www.youtube.com/watch?v=xvFZjo5PgG0';

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
        window.open(MODIFY_OFFER_LINK, '_blank', 'noreferrer')?.focus();
        handleOnClose();
    };

    return (
        <GenericModal
            className={'OffersModal'}
            show={show}
            id='OffersModal'
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
                            id='offers_modal.title'
                            defaultMessage='Increase the storage space of your kSuite!'
                        />
                    </div>
                    <div className='subtitle'>
                        <FormattedMessage
                            id='offers_modal.subtitle'
                            defaultMessage='Your storage space is full. Unlock more applications and features by boosting your storage space and maximize collaborative work with kDrive, kChat... Sign up for a premium offer to send new files to kChat and kDrive.'
                        />
                        <p className='modify-link'>
                            <a
                                href={LEARN_MORE_LINK}
                                target='_blank'
                                rel='noreferrer'
                            >
                                <FormattedMessage
                                    id='offers_modal.link'
                                    defaultMessage='Learn more'
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
                            id='offers_modal.cancel'
                            defaultMessage='Not at the moment'
                        />
                    </button>
                    <button
                        onClick={handleAccept}
                        className='btn btn-primary'
                        id='modify-offer'
                    >
                        <FormattedMessage
                            id='offers_modal.accept'
                            defaultMessage='Modify my offer'
                        />
                    </button>
                </div>
            </>
        </GenericModal>
    );
};

export default OffersModal;
