// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */

import {MutableRefObject} from 'react';

const KMEET_DOMAIN = 'kmeet.preprod.dev.infomaniak.ch';

class JitsiClient {
    api: any;
    channelID: string | void;
    disconnect: Function | void;
    subscribers: {[event: string]: Function[]};
    audioMuteStatusChanged: Function;
    readyToClose: Function;

    constructor() {
        // this.init = this.init.bind(this);
        this.channelID = undefined;
        this.disconnect = undefined;
        this.subscribers = {
            audioMuteStatusChanged: [],
            readyToClose: [],
        };
        if (!(window as any).JitsiMeetExternalAPI) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://kmeet.preprod.dev.infomaniak.ch/external_api.js';
            document.head.appendChild(script);
        }
    }

    init(channelID: string, disconnectFunc: Function, parentRef: MutableRefObject<HTMLDivElement | null>) {
        // if (parentRef.current) {
        //     this.channelID = channelID;
        //     this.disconnect = disconnectFunc;
        //     const configOverwrite = {
        //         startWithAudioMuted: false,
        //         startWithVideoMuted: true,
        //         subject: this.channelID,
        //         prejoinConfig: {enabled: false},
        //         disableDeepLinking: true,
        //     };

        //     this.api = new (window as any).JitsiMeetExternalAPI(KMEET_DOMAIN,
        //         {configOverwrite,
        //             parentNode: parentRef.current,
        //             onload: () => {
        //                 console.log('[jitsi] api onload');

        //                 // for (const [event, callbacks] of Object.entries(this.subscribers)) {
        //                 //     callbacks.forEach((cb) => {
        //                 //         this.api.addEventListener(event, this.log);
        //                 //     });
        //                 // }
        //             },
        //             roomName: this.channelID});

        //     this.api.addListener('audioMuteStatusChanged', (data: {muted: boolean}) => {
        //         if (this.audioMuteStatusChanged) {
        //             this.audioMuteStatusChanged(data);
        //         }
        //     });
        //     this.api.on('readyToClose', () => {
        //         if (this.readyToClose) {
        //             this.readyToClose();
        //         }
        //     });
        // }
    }

    executeCommand(command: string) {
        console.log(this.api);
        this.api.executeCommand(command);
    }

    getIFrame() {
        return this.api.getIFrame();
    }

    getParticipants() {
        return this.api.getParticipantsInfo();
    }
    subscribeToEvent(event: string, callback: Function): void {
        if (!this.api) {
            this.subscribers[event].push(callback);
            return;
        }
        this.api.on(event, callback);
    }
    dispose() {
        this.api.dispose();

        // this.api = undefined;
        // if (window.MeetConferenceWindow) {
        //     MeetConferenceWindow.close();
        // }
        this.subscribers = {
            audioMuteStatusChanged: [],
            readyToClose: [],
        };
    }
}
const client = new JitsiClient();
export default client;
