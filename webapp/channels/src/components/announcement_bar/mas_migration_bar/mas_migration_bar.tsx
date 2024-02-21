// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import ExternalLink from 'components/external_link';

import {AnnouncementBarTypes} from 'utils/constants';
import {isNotMacMas} from 'utils/user_agent';

import informationIcon from 'images/icons/information-blue.svg';

import AnnouncementBar from '../default_announcement_bar';

interface Props {
    showMASBanner: boolean;
}

export default class MASMigrationBar extends React.PureComponent <Props> {
    render() {
        const {showMASBanner} = this.props;

        if (showMASBanner && !isNotMacMas()) {
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.INFOMANIAK_ADVISOR}
                    icon={
                        <img
                            className='advisor-icon'
                            src={informationIcon}
                        />
                    }
                    message={
                        <FormattedMessage
                            id='masBar.migrate'
                            defaultMessage='The kChat application is now available on the App Store. <link>Download it</link> to benefit automatically from future updates.'
                            values={{
                                link: (msg: React.ReactNode) => (
                                    <ExternalLink
                                        href='https://apps.apple.com/app/infomaniak-kchat/id6443845553'
                                    >
                                        {msg}
                                    </ExternalLink>
                                ),
                            }}
                        />
                    }
                />
            );
        }

        return null;
    }
}
