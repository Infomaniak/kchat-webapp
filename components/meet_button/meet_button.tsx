// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef} from 'react';
import {injectIntl, IntlShape} from 'react-intl';

// import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import CameraIcon from 'components/widgets/icons/camera_icon';

export type Props = {
    currentChannelID: string;
    hasCall: boolean;
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

    const onClick = async () => {
        startCallInChannel();

        // const options = {
        //     windowName: 'kmeet',
        //     windowOptions: 'location=0,status=0,width=900,height=500',
        //     callback: () => console.log('callback kmeet'),
        // };

        // window.open('/static/call.html', options.windowName, options.windowOptions);
    };

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
                <CameraIcon className='d-flex'/>
                <span
                    className='icon__text'
                    style={{margin: '0 4px'}}
                >
                    {props.hasCall ? 'Join Call' : 'Start Call'}
                </span>
            </div>
        </button>
    );
}

const wrappedComponent = injectIntl(MeetButton);
wrappedComponent.displayName = 'injectIntl(MeetButton)';
export default wrappedComponent;
