/* eslint-disable no-mixed-operators */
/* eslint-disable guard-for-in */
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {AnnouncementBarTypes} from 'utils/constants';
import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import * as UserAgent from 'utils/user_agent';

import warningIcon from 'images/icons/warning-alert.svg';

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

        if (!UserAgent.isNotMacMas()) {
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
                type={AnnouncementBarTypes.WARNING}
                icon={
                    <img
                        className='version-alert-icon'
                        src={warningIcon}
                    />
                }
                message={
                    <>
                        <div style={{fontWeight: 400}}>

                            <FormattedMessage
                                id='appstore.bar'
                                defaultMessage='Your version of the app is no longer supported. Please'
                            />
                            {' '}
                            {/* eslint-disable-next-line @mattermost/use-external-link */}
                            <a
                                href='https://apps.apple.com/app/infomaniak-kchat/id6443845553'
                                target='_blank'
                                rel='noreferrer'
                            >
                                <FormattedMessage
                                    id='appstore.bar.update'
                                    defaultMessage='install the new version'
                                />
                            </a>
                            {' '}
                            <FormattedMessage
                                id='appstore.bar.end'
                                defaultMessage='before September 2nd to benefit from the latest improvements.'
                            />
                        </div>
                    </>
                }
            />
        );
    }
}
