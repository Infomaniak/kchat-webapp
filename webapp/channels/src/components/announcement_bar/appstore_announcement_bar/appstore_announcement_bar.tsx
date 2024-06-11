/* eslint-disable no-mixed-operators */
/* eslint-disable guard-for-in */
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {AnnouncementBarTypes} from 'utils/constants';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import * as UserAgent from 'utils/user_agent';

import informationIcon from 'images/icons/information-blue.svg';

import AnnouncementBar from '../default_announcement_bar';

export interface Props {
    latestVersion?: string | undefined;
}
export default class AppStoreBar extends React.PureComponent<Props> {
    render() {
        const {latestVersion} = this.props;
        const latestVer = latestVersion || '';
        const userAgentVersion = UserAgent.getDesktopVersion();

        if (!UserAgent.isMacApp()) {
            return null;
        }

        if (UserAgent.isNotMacMas()) {
            return null;
        }

        if (!latestVer || !userAgentVersion) {
            return null;
        }
        if (isServerVersionGreaterThanOrEqualTo(userAgentVersion, latestVer)) {
            return null;
        }
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
}
