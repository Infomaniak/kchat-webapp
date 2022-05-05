// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */
import * as React from 'react';

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import JitsiMeetClient from '../jitsi_client';

type Props = {
    portal: boolean;
    channelID: string;
    currentUserId: string;
    disconnectFunc: (channelID: string) => (dispatch: DispatchFunc, getState: GetStateFunc) => void;
}

const CallIframe = (props: Props) => {
    const j = JitsiMeetClient;

    const ref = React.useRef<null | HTMLDivElement>(null);

    React.useEffect(() => {
        if (ref) {
            j.init(props.channelID, props.disconnectFunc, ref);
        }
    }, [ref]);

    return (
        <div
            ref={ref}
            style={props.portal ? ({
                position: 'absolute',
                bottom: 0,
                top: 0,
                right: 0,
                left: 0,
                zIndex: 999,
            }) : {}}
            className={props.portal ? '' : 'hidden'}
        />);
};

export default CallIframe;
