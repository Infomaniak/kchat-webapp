// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import {useDispatch} from 'react-redux';

import OffersModal from 'components/offers_modal/offers_modal';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import './channel_message_limitation_banner.scss';
import {DispatchFunc} from 'mattermost-redux/types/actions';

type Props = {
    olderMessagesDate: string;
}

export default function ChannelMessageLimitaionBanner(props: Props) {
    const dispatch = useDispatch<DispatchFunc>();

    const {
        olderMessagesDate,
    } = props;

    function handleButtonClick() {
        dispatch(openModal({
            modalId: ModalIdentifiers.OFFERS,
            dialogType: OffersModal,
        }));
    }

    return (
        <p className='channel-limitation-banner'>
            <span>
                <strong>
                    {'This is just a placeholder:'}
                    {' '}
                    {olderMessagesDate}
                </strong>
                <button
                    className='channel-limitation-banner__button'
                    onClick={handleButtonClick}
                >
                    {'See offers'}
                </button>
            </span>
        </p>
    );
}
