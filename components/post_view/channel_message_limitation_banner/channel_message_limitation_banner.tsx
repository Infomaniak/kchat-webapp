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
import MaxMessagesIconSvg from 'components/common/svg_images_components/max_messages_icon_svg';

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
            <span className='max-messages-icon'>
                <MaxMessagesIconSvg/>
            </span>
            <span>
                {`Il se peut que les messages avant le ${olderMessagesDate} n'apparaîssent pas car votre kChat a atteint la limite des 10'000 messages. Pour afficher plus de messages, souscrivez à une offre suprérieure.`}
                {' '}
                <button
                    className='channel-limitation-banner__button'
                    onClick={handleButtonClick}
                >
                    {'Modifier mon offre'}
                </button>
            </span>
        </p>
    );
}
