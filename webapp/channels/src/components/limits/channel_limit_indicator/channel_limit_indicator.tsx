// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import type {ChannelType} from '@mattermost/types/channels';

import {General} from 'mattermost-redux/constants';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import {useNextPlan} from 'components/common/hooks/useNextPlan';
import UpgradeOfferIcon from 'components/widgets/icons/upgrade_offer_icon';

import './channel_limit_indicator.scss';

type Props = {
    type: ChannelType;
};

const ChannelLimitIndicator = ({type}: Props) => {
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const {public_channels: publicChannelsUsage, private_channels: privateChannelsUsage} = useGetUsage();
    const {public_channels: publicChannelsLimit, private_channels: privateChannelsLimit} = useGetLimits()[0];
    const {public_channels: publicChannelsUsageDelta, private_channels: privateChannelsUsageDelta} = useGetUsageDeltas();

    const nextPlan = useNextPlan();

    const publicChannelLimitReached = publicChannelsUsageDelta >= 0;
    const privateChannelLimitReached = privateChannelsUsageDelta >= 0;

    if ((type === General.OPEN_CHANNEL && !publicChannelLimitReached) || (type === General.PRIVATE_CHANNEL && !privateChannelLimitReached)) {
        return null;
    }

    return (
        <div className='channel-limit-indicator'>
            <UpgradeOfferIcon/>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <FormattedMessage
                    id='channelLimitIndicator.text'
                    defaultMessage='You have reached the limit of {type, select, O {public channels} P {private channels} other {}} ({usage, number}/{limit, number}) on your kSuite offer. {isAdmin, select, true {Modify your offer to create additional channels.} other {Please contact an administrator to modify the offer.}}'
                    values={{
                        type,
                        isAdmin,
                        usage: type === General.OPEN_CHANNEL ? publicChannelsUsage : privateChannelsUsage,
                        limit: type === General.OPEN_CHANNEL ? publicChannelsLimit : privateChannelsLimit,
                    }}
                />
                <wc-ksuite-pro-upgrade-dialog offer={nextPlan}>
                    <a
                        href='#'
                        slot='trigger-element'
                    >
                        <FormattedMessage
                            id='channelLimitIndicator.upsell'
                            defaultMessage='Upgrade'

                        />
                    </a>
                </wc-ksuite-pro-upgrade-dialog>
            </div>
        </div>
    );
};

export default ChannelLimitIndicator;
