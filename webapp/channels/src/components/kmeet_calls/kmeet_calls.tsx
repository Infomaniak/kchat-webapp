import type {ExternalAPIOptions} from 'jitsi-meet';
import React from 'react';
import type {RouteComponentProps} from 'react-router-dom';

import JitsiApi from './externals/external_api.js';

// eslint-disable-next-line react/require-optimization
class KmeetCalls extends React.Component<RouteComponentProps<{ conference?: string }>> {
    componentDidMount() {
        const options: ExternalAPIOptions = {
            width: '100%',
            height: '100%',
            parentNode: document.querySelector('#jitsiContainer') ?? undefined,
            roomName: this.props!.match!.params!.conference,
        };

        const api = new JitsiApi('kmeet.preprod.dev.infomaniak.ch', options);

        console.log('api', api);
    }

    render() {
        return <div id='#jitsiContainer'/>;
    }
}

export default KmeetCalls;
