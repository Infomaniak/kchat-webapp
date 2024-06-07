/* eslint-disable no-mixed-operators */
/* eslint-disable guard-for-in */
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {ClientConfig} from '@mattermost/types/config';

import {AnnouncementBarTypes} from 'utils/constants';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import * as UserAgent from 'utils/user_agent';

import informationIcon from 'images/icons/information-blue.svg';

import AnnouncementBar from '../default_announcement_bar';

interface Props {
    config?: Partial<ClientConfig>;
}
const versionMapping = {
    '3.0.0': '1.0.0',
    '3.2.0': '1.0.1',
    '3.3.0': '1.0.2',
};
function findClosestVersion(userAgentVersion: string, versionMapping: Record<string, string>): string {
    let closestVersion = Object.keys(versionMapping)[0];
    let closestDistance = versionDistance(userAgentVersion, closestVersion);

    for (const version in versionMapping) {
        const distance = versionDistance(userAgentVersion, version);
        if (distance < closestDistance) {
            closestVersion = version;
            closestDistance = distance;
        }
    }
    return versionMapping[closestVersion];
}

function versionDistance(version1: string, version2: string): number {
    const [major1, minor1, patch1] = version1.split('.').map(Number);
    const [major2, minor2, patch2] = version2.split('.').map(Number);

    return Math.abs(major1 - major2) * 10000 + Math.abs(minor1 - minor2) * 100 + Math.abs(patch1 - patch2);
}

export default class AppStoreBar extends React.PureComponent <Props> {
    render() {
        const {config} = this.props;
        const latestVersion = config!.MASLatestVersion!;

        const userAgentVersion = UserAgent.getDesktopVersion();
        let currentVersion = versionMapping[userAgentVersion as keyof typeof versionMapping];

        if (!currentVersion) {
            currentVersion = findClosestVersion(userAgentVersion, versionMapping);
        }

        if (userAgentVersion && isServerVersionGreaterThanOrEqualTo(latestVersion, currentVersion) && currentVersion !== latestVersion) {
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.UPDATE_MAC}
                    icon={
                        <img
                            className='version-alert-icon'
                            src={informationIcon}
                        />
                    }
                    message={
                        <React.Fragment>
                            <div style={{fontWeight: 400}}>

                                <FormattedMessage
                                    id='appstore.bar'
                                    defaultMessage='A new version of the kChat app is available. Please'
                                />
                                <a
                                    style={{marginLeft: '.5rem'}}
                                    href='https://apps.apple.com/fr/app/infomaniak-kchat/id6443845553'
                                >
                                    <FormattedMessage
                                        id='appstore.bar.update'
                                        defaultMessage='update'
                                    />
                                </a>
                                <FormattedMessage
                                    id='appstore.bar.end'
                                    defaultMessage=' from the App Store to benefit from the latest improvements'
                                />
                                {'.'}
                            </div>

                        </React.Fragment>
                    }
                />
            );
        }
        return null;
    }
}
