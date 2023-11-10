// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {IntlShape} from 'react-intl';
import {FormattedMessage, injectIntl} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import {ChannelHeaderDropdownItems} from 'components/channel_header_dropdown';
import StatusIcon from 'components/status_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {Constants} from 'utils/constants';

import MobileChannelHeaderDropdownAnimation from './mobile_channel_header_dropdown_animation';

import './mobile_channel_header_dropdown.scss';

type Props = {
    user: UserProfile;
    channel: Channel;
    teammateId: string | null;
    teammateIsBot?: boolean;
    teammateStatus?: string;
    displayName: string;
    intl: IntlShape;
}

class MobileChannelHeaderDropdown extends React.PureComponent<Props> {
    getChannelTitle = () => {
        const {user, channel, teammateId, displayName} = this.props;

        if (channel.type === Constants.DM_CHANNEL) {
            if (user.id === teammateId) {
                return (
                    <FormattedMessage
                        id='channel_header.directchannel.you'
                        defaultMessage='{displayname} (you)'
                        values={{displayname: displayName}}
                    />
                );
            }
            return displayName;
        }
        return channel.display_name;
    };

    render() {
        const {teammateIsBot, teammateStatus} = this.props;
        let dmHeaderIconStatus;

        if (!teammateIsBot) {
            dmHeaderIconStatus = (
                <StatusIcon status={teammateStatus}/>
            );
        }

        return (
            <MenuWrapper animationComponent={MobileChannelHeaderDropdownAnimation}>
                <a>
                    <span className='heading'>
                        {dmHeaderIconStatus}
                        {this.getChannelTitle()}
                    </span>
                    <span
                        className='fa fa-angle-down header-dropdown__icon'
                        title={this.props.intl.formatMessage({id: 'generic_icons.dropdown', defaultMessage: 'Dropdown Icon'})}
                    />
                </a>

                <Menu
                    className='mt-8 mobile-channel-header-dropdown'
                    ariaLabel={this.props.intl.formatMessage({id: 'channel_header.menuAriaLabel', defaultMessage: 'Channel Menu'})}
                >
                    <ChannelHeaderDropdownItems isMobile={true}/>
                    <div className='Menu__close visible-xs-block'>
                        {'×'}
                    </div>
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(MobileChannelHeaderDropdown);

