// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamAccountId} from 'mattermost-redux/selectors/entities/teams';

import {redirectTokSuiteDashboard} from 'actions/global_actions';

import MaxMessagesIconSvg from 'components/common/svg_images_components/max_messages_icon_svg';

import './channel_message_limitation_banner.scss';

export default function ChannelMessageLimitationBanner() {
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const currentTeamAccountId = useSelector(getCurrentTeamAccountId);

    function handleButtonClick() {
        redirectTokSuiteDashboard(currentTeamAccountId);
    }

    return (
        <p className='channel-limitation-banner'>
            <span className='max-messages-icon'>
                <MaxMessagesIconSvg/>
            </span>
            <span>
                <FormattedMessage
                    id='channel_limitation.messages'
                    defaultMessage='Messages and files older than 3 months are hidden. To view more posts, {isAdmin, select, true {subscribe to a higher offer. <modifyOffer>Change my offer</modifyOffer>} other {contact an administrator to subscribe to a higher offer}}'
                    values={{
                        isAdmin,
                        modifyOffer: (chunks: string[]) => (<a onClick={handleButtonClick}>{chunks}</a>),
                    }}
                />
            </span>
        </p>
    );
}
