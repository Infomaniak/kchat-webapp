// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import {quotaGate} from 'mattermost-redux/utils/plans_util';

import {openModal} from 'actions/views/modals';

import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import * as Menu from 'components/menu';
import UnarchiveChannelModal from 'components/unarchive_channel_modal';

import {ModalIdentifiers} from 'utils/constants';

type Props = {
    channel: Channel;
}

const UnarchiveChannel = ({
    channel,
}: Props) => {
    const dispatch = useDispatch();
    const currentPack = useSelector(getCurrentPackName);
    const {public_channels: publicChannels} = useGetUsageDeltas();
    const {isQuotaExceeded, withQuotaCheck} = quotaGate(publicChannels, currentPack);

    const handleUnarchiveChannel = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.UNARCHIVE_CHANNEL,
                dialogType: UnarchiveChannelModal,
                dialogProps: {channel},
            }),
        );
    };

    return (
        <>
            <Menu.Separator/>
            <Menu.Item
                id='channelUnarchiveChannel'
                onClick={withQuotaCheck(handleUnarchiveChannel)}
                labels={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <FormattedMessage
                            id='channel_header.unarchive'
                            defaultMessage='Unarchive Channel'
                        />
                        {isQuotaExceeded && <wc-ksuite-pro-upgrade-tag/>}
                    </div>
                }
            />
        </>
    );
};

export default memo(UnarchiveChannel);
