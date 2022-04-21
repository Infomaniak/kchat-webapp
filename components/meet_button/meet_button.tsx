// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef} from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import CameraIcon from 'components/widgets/icons/camera_icon';

type Props = {
    currentChannel: Channel;
    channelMember?: ChannelMembership;
    intl: IntlShape;
    locale: string;
}

const configOverwrite = {
    startWithAudioMuted: false,
    startWithVideoMuted: true,
    subject: 'toto',
};

function MeetButton(props: Props) {
    const {formatMessage} = props.intl;
    const ref = useRef<HTMLButtonElement>(null);

    const onClick = () => {
        const options = {
            windowName: 'kmeet',
            windowOptions: 'location=0,status=0,width=900,height=500',
            callback: () => console.log('callback kmeet'),
        };

        window.open('/static/call.html', options.windowName, options.windowOptions);
    };

    return (
        <button
            type='button'
            className='style--none post-action'
            onClick={onClick}
            ref={ref}
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
