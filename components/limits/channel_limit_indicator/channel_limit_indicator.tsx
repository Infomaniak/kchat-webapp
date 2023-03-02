// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import UpgradeOfferIcon from 'components/widgets/icons/upgrade_offer_icon';

import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetLimits from 'components/common/hooks/useGetLimits';

import {ChannelType} from '@mattermost/types/channels';
import {General} from 'mattermost-redux/constants';
import {getCurrentTeamAccountId} from 'mattermost-redux/selectors/entities/teams';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {getUsage} from 'actions/cloud';
import {redirectTokSuiteDashboard} from 'actions/global_actions';

import './channel_limit_indicator.scss';

type Props = {
    type: ChannelType;
    setLimitations: (limtation: Record<typeof General.OPEN_CHANNEL | typeof General.PRIVATE_CHANNEL, boolean>) => void;
};

const ChannelLimitIndicator = ({type, setLimitations}: Props) => {
    const dispatch = useDispatch();
    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const currentTeamAccountId = useSelector(getCurrentTeamAccountId);
    const [loaded, setLoaded] = useState(false);
    const {public_channels: publicChannelsUsage, private_channels: privateChannelsUsage} = useGetUsage();
    const {public_channels: publicChannelsLimit, private_channels: privateChannelsLimit} = useGetLimits()[0];
    const {public_channels: publicChannelsUsageDelta, private_channels: privateChannelsUsageDelta} = useGetUsageDeltas();

    const publicChannelLimitReached = publicChannelsUsageDelta >= 0;
    const privateChannelLimitReached = privateChannelsUsageDelta >= 0;

    const loadUsage = useCallback(async () => {
        const {data} = await dispatch(getUsage());
        if (data) {
            setLoaded(true);
        }
    }, [dispatch]);

    useEffect(() => {
        loadUsage();
    }, [loadUsage]);

    useEffect(() => {
        if (loaded) {
            setLimitations({
                [General.OPEN_CHANNEL]: publicChannelLimitReached,
                [General.PRIVATE_CHANNEL]: privateChannelLimitReached,
            });
        }
    }, [publicChannelLimitReached, privateChannelLimitReached, loaded]);

    if ((type === General.OPEN_CHANNEL && !publicChannelLimitReached) || (type === General.PRIVATE_CHANNEL && !privateChannelLimitReached)) {
        return null;
    }

    return (
        <div className='channel-limit-indicator'>
            <UpgradeOfferIcon/>
            <FormattedMessage
                id='channelLimitIndicator.text'
                defaultMessage='You have reached the limit of {type, select, O {public channels} P {private channels} other {}} ({usage, number}/{limit, number}) on your kSuite offer. {isAdmin, select, true {<modifyOffer>Modify your offer</modifyOffer> to create additional channels.} other {Please contact an administrator to modify the offer.}}'
                values={{
                    type,
                    isAdmin,
                    usage: type === General.OPEN_CHANNEL ? publicChannelsUsage : privateChannelsUsage,
                    limit: type === General.OPEN_CHANNEL ? publicChannelsLimit : privateChannelsLimit,
                    modifyOffer: (chunks: string[]) => (<a onClick={() => redirectTokSuiteDashboard(currentTeamAccountId)}>{chunks}</a>),
                }}
            />
        </div>
    );
};

export default ChannelLimitIndicator;
