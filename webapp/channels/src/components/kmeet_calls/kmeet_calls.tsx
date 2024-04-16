import type {ExternalAPIOptions, JitsiMeetExternalAPI} from 'jitsi-meet';
import React from 'react';
import type {RouteComponentProps} from 'react-router-dom';

import type {UserProfile} from '@mattermost/types/users.js';

import {Client4} from 'mattermost-redux/client';

import JitsiApi from './externals/external_api.js';

type Props = RouteComponentProps<{ conference?: string }> & {
    user: UserProfile;
    locale: string;
}

// eslint-disable-next-line react/require-optimization
class KmeetCalls extends React.Component<Props> {
    containerRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.containerRef = React.createRef();
    }

    componentDidMount() {
        const options: ExternalAPIOptions = {
            width: '100%',
            height: '100%',
            parentNode: this.containerRef.current ?? undefined,
            roomName: this.props.match.params.conference,
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                VIDEO_LAYOUT_FIT: 'height',
            },
            userInfo: {
                displayName: this.props.user.first_name,
                email: this.props.user.email,
            },
            configOverwrite: {
                defaultLanguage: this.props.locale,
                prejoinPageEnabled: false,
            },
        };

        const api = new JitsiApi('kmeet.preprod.dev.infomaniak.ch', options) as JitsiMeetExternalAPI;

        api.executeCommand('avatarUrl', Client4.getProfilePictureUrl(this.props.user.id, this.props.user.last_picture_update));
    }

    render() {
        return (
            <div
                style={{height: '100vh'}}
                ref={this.containerRef}
            />
        );
    }
}

export default KmeetCalls;
