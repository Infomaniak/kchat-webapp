// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import CameraIcon from 'components/widgets/icons/camera_icon';

type Props = {
    currentChannel: Channel;
    channelMember?: ChannelMembership;
    intl: IntlShape;
    locale: string;
}

function MeetButton(props: Props) {
    const {formatMessage} = props.intl;

    return (
        <button
            type='button'
            className='style--none post-action'
        >
            <div
                className='icon icon--attachment'
            >
                <CameraIcon className='d-flex'/>
            </div>
        </button>
    );
}

const wrappedComponent = injectIntl(MeetButton);
wrappedComponent.displayName = 'injectIntl(MeetButton)';
export default wrappedComponent;
