// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {AnnouncementBarTypes} from 'utils/constants';

import AnnouncementBar from '../default_announcement_bar';

interface Props {
    buildHash?: string;
    isNewVersionCanaryOnly?: boolean;
}

interface State {
    buildHashOnAppLoad?: string;
}

export default class VersionBar extends React.PureComponent <Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            buildHashOnAppLoad: props.buildHash === 'none' ? GIT_RELEASE : props.buildHash,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (!state.buildHashOnAppLoad && props.buildHash) {
            return {
                buildHashOnAppLoad: props.buildHash,
            };
        }

        return null;
    }

    reloadPage = () => {
        window.location.reload();
    };

    render() {
        const {buildHashOnAppLoad} = this.state;
        const {buildHash, isNewVersionCanaryOnly} = this.props;
        const isCanary = document.cookie.indexOf('KCHAT_NEXT=always') !== -1;

        // IK: isNewVersionCanaryOnly is populated only on WS
        // For example, this variable is needed if WS trigger update for Canary, but not stable
        // If Client receive this message, but it is on stable, the update will be ignored
        // Otherwise, API call to check for update based on which one requested it - isNewVersionCanaryOnly will be undefined
        const isStableUpdate = !isCanary && isNewVersionCanaryOnly !== true;
        const isNextUpdate = isCanary && isNewVersionCanaryOnly !== false;

        if (!buildHashOnAppLoad || buildHash === 'none') {
            return null;
        }

        if (buildHashOnAppLoad !== buildHash && (isNextUpdate || isStableUpdate)) {
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.ANNOUNCEMENT}
                    message={
                        <React.Fragment>
                            <FormattedMessage
                                id='version_bar.new'
                                defaultMessage='A new version of kChat is available.'
                            />
                            <a
                                onClick={this.reloadPage}
                                style={{marginLeft: '.5rem'}}
                            >
                                <FormattedMessage
                                    id='version_bar.refresh'
                                    defaultMessage='Refresh the app now'
                                />
                            </a>
                            {'.'}
                        </React.Fragment>
                    }
                />
            );
        }

        return null;
    }
}
