// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef} from 'react';
import {injectIntl, IntlShape} from 'react-intl';

// import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {useSelector} from 'react-redux';

import {CameraOutlineIcon} from '@mattermost/compass-icons/components';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

export type Props = {
    currentChannelID: string;
    hasCall?: boolean;
    intl: IntlShape;
    startCallInChannel: Function;
}

// const configOverwrite = {
//     startWithAudioMuted: false,
//     startWithVideoMuted: true,
//     subject: 'toto',
// };

function MeetButton(props: Props) {
    // const {formatMessage} = props.intl;
    const {startCallInChannel} = props;
    const ref = useRef<HTMLButtonElement>(null);
    const channelID = useSelector(getCurrentChannelId);

    const onClick = React.useCallback(() => {
        startCallInChannel(channelID);
    }, [channelID]);

    return (
        <button
            type='button'
            className='style--none channel-header__push-right'
            onClick={onClick}
            ref={ref}
        >
            <div
                className='icon icon--attachment'
            >
                <div className='channel-header__icon channel-header__icon--wide channel-header__icon--left'>
                    <CameraOutlineIcon/>
                    <span
                        className='icon__text'
                        style={{margin: '0 6px'}}
                    >
                        {props.hasCall ? 'Join Call' : 'Start Call'}
                    </span>
                </div>
            </div>
        </button>
    );
}

const wrappedComponent = injectIntl(MeetButton);
wrappedComponent.displayName = 'injectIntl(MeetButton)';
export default wrappedComponent;
