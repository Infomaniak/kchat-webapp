// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import {MutableRefObject} from 'react';

const KMEET_DOMAIN = 'kmeet.infomaniak.com';

class JitsiClient {
    private api: any;
    channelID: string | void;
    disconnect: Function | void;

    constructor() {
        this.init = this.init.bind(this);
        this.channelID = undefined;
        this.disconnect = undefined;
        if (!(window as any).JitsiMeetExternalAPI) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://kmeet.infomaniak.com/external_api.js';
            document.head.appendChild(script);
        }
    }

    init(channelID: string, disconnectFunc: Function, parentRef: MutableRefObject<HTMLDivElement | null>) {
        if (parentRef.current && (this.channelID !== channelID || !this.api)) {
            this.channelID = channelID;
            this.disconnect = disconnectFunc;
            const configOverwrite = {
                startWithAudioMuted: false,
                startWithVideoMuted: true,
                subject: this.channelID,
                prejoinConfig: {enabled: false},
                disableDeepLinking: true,
            };

            this.api = new (window as any).JitsiMeetExternalAPI(KMEET_DOMAIN,
                {configOverwrite,
                    parentNode: parentRef.current,
                    onload: () => console.log('[jitsi] api onload'),
                    roomName: this.channelID});

            this.subscribeToBaseEvents();
        }
    }

    getIFrame() {
        return this.api.getIFrame();
    }

    getParticipants() {
        return this.api.getParticipantsInfo();
    }

    subscribeToBaseEvents() {
        this.api.on('videoConferenceJoined', () => {
            console.log('[jitsi] videoConferenceJoined');
        });

        this.api.on('readyToClose', () => {
            console.log('[jitsi] readyToClose');
            if (this.disconnect) {
                this.disconnect(this.channelID);
            }
        });

        this.api.on('participantJoined', () => {
            console.log('[jitsi] participant-joined');
        });
        this.api.on('audioMuteStatusChanged', ({muted}: {muted: boolean}) => {
            console.log('[jitsi] audioMuteStatusChanged', muted);
        });
    }
}
const client = new JitsiClient();
export default client;
