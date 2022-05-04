// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';
import {createPortal} from 'react-dom';

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import JitsiMeetClient from '../jitsi_client';

type Props = {
    portal: boolean;
    channelID: string;
    currentUserId: string;
    disconnectFunc: (channelID: string) => (dispatch: DispatchFunc, getState: GetStateFunc) => void;
}

const CallIframe = (props: Props) => {
    const [container, setContainer] = React.useState<null | HTMLDivElement>(null);
    const newWindow = React.useRef<Window | null>(null);

    const ref = React.useRef<null | HTMLDivElement>(null);
    const api = JitsiMeetClient;
    React.useEffect(() => {
        if (ref) {
            api.init(props.channelID, props.disconnectFunc, ref);
        }
    }, [ref]);

    React.useEffect(() => {
        // Create container element on client-side
        setContainer(document.createElement('div'));
    }, [props.portal]);

    React.useEffect(() => {
        if (window.desktop) {
            return;
        }

        // When container is ready
        if (props.portal && ref.current) {
        // Create window
            newWindow.current = window.open(
                '',
                '',
                'width=1100,height=800,left=200,top=200,resizable=yes',
            );

            // console.log(container)

            // Append container
            if (newWindow.current) {
                newWindow.current.document.body.appendChild(ref.current);
            }

            // Save reference to window for cleanup
            const curWindow = newWindow.current;

            // Return cleanup function
            return () => curWindow && curWindow.close();
        }
    }, [props.portal]);

    return (
        <div
            ref={ref}
            style={props.portal ? ({
                position: 'absolute',
                bottom: 0,
                top: 0,
                zIndex: 999,
                right: 0,
                left: 0,
            }) : {}}
            className={props.portal ? '' : 'hidden'}
        />);
};

export default CallIframe;
