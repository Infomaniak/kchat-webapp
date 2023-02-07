// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {useIntl} from 'react-intl';

import {GlobalState} from '@mattermost/types/store';
import {isChannelBeingTypedIn, makeGetUsersTypingByChannelAndPost} from 'mattermost-redux/selectors/entities/typing';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import Constants from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import './channel_typing.scss';

type Props = {
    channelId: string;
}

const ChannelTyping = ({channelId}: Props) => {
    const channelBeingTypedIn = useSelector((state: GlobalState) => isChannelBeingTypedIn(state, channelId));
    const getUsersTypingByChannelAndPost = makeGetUsersTypingByChannelAndPost();
    const usersTyping = useSelector((state: GlobalState) => getUsersTypingByChannelAndPost(state, {channelId, postId: ''}));
    const currentChannelId = useSelector(getCurrentChannelId);
    const {formatMessage} = useIntl();

    const overlay = (
        <Tooltip id={`channel-typing-tooltip-${channelId}`}>
            {formatMessage({id: 'channel_typing', defaultMessage: '{usersTyping} {length, plural, =1 {is} other {are}} typing...'}, {usersTyping: usersTyping.join(', '), length: usersTyping.length})}
        </Tooltip>
    );

    if (!channelBeingTypedIn || channelId === currentChannelId) {
        return null;
    }

    return (
        <OverlayTrigger
            delay={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            overlay={overlay}
        >
            <div className='channel-typing'>
                <div className='dot'/>
                <div className='dot'/>
                <div className='dot'/>
            </div>
        </OverlayTrigger>
    );
};

export default ChannelTyping;
