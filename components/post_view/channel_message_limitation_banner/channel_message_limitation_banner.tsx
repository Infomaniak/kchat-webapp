// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import {useDispatch} from 'react-redux';

import {FormattedDate, FormattedMessage} from 'react-intl';

import OffersModal from 'components/offers_modal/offers_modal';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import './channel_message_limitation_banner.scss';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import MaxMessagesIconSvg from 'components/common/svg_images_components/max_messages_icon_svg';
import {getMonthLong} from 'utils/i18n';
import {getCurrentLocale} from 'selectors/i18n';
import store from 'stores/redux_store.jsx';

const getState = store.getState;

type Props = {
    olderMessagesDate: string;
}

export default function ChannelMessageLimitationBanner(props: Props) {
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

    const locale = getCurrentLocale(getState());
    const epochDate = Math.floor(new Date(olderMessagesDate).getTime());
    const date = (
        <FormattedDate
            value={epochDate}
            month={getMonthLong(locale)}
            day='2-digit'
            year='numeric'
        />
    );

    return (
        <p className='channel-limitation-banner'>
            <span className='max-messages-icon'>
                <MaxMessagesIconSvg/>
            </span>
            <span>
                <FormattedMessage
                    id='channel_limitation.messages'
                    defaultMessage='Messages before {date} may not appear because your kChat has reached the 10,000 message limit. To display more messages, subscribe to a higher plan.'
                    values={{
                        date,
                    }}
                />
                {' '}
                <button
                    className='channel-limitation-banner__button'
                    onClick={handleButtonClick}
                >
                    <FormattedMessage
                        id='channel_limitation.messages_button'
                        defaultMessage='Modify my offer'
                    />
                </button>
            </span>
        </p>
    );
}
