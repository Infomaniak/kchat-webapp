// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import {quotaGate} from 'mattermost-redux/utils/plans_util';

import {openModal} from 'actions/views/modals';

import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import ConvertChannelModal from 'components/convert_channel_modal';
import * as Menu from 'components/menu';

import {ModalIdentifiers} from 'utils/constants';

type Props = {
    channel: Channel;
}

const ConvertPublictoPrivate = ({channel}: Props): JSX.Element => {
    const dispatch = useDispatch();
    const currentPack = useSelector(getCurrentPackName);
    const {private_channels: privateChannels} = useGetUsageDeltas();
    const {isQuotaExceeded, withQuotaCheck} = quotaGate(privateChannels, currentPack);

    const handleConvertToPrivate = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.CONVERT_CHANNEL,
                dialogType: ConvertChannelModal,
                dialogProps: {
                    channelId: channel.id,
                    channelDisplayName: channel.display_name,
                },
            }),
        );
    };

    return (
        <Menu.Item
            id='channelConvertToPrivate'
            onClick={withQuotaCheck(handleConvertToPrivate)}
            labels={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <FormattedMessage
                        id='channel_header.convert'
                        defaultMessage='Convert to Private Channel'
                    />
                    {isQuotaExceeded && <wc-ksuite-pro-upgrade-tag/>}
                </div>
            }
        />
    );
};

export default React.memo(ConvertPublictoPrivate);
