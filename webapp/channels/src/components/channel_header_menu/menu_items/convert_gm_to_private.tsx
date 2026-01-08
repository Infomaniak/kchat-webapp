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
import ConvertGmToChannelModal from 'components/convert_gm_to_channel_modal';
import * as Menu from 'components/menu';

import {ModalIdentifiers} from 'utils/constants';

type Props = {
    channel: Channel;
}

const ConvertGMtoPrivate = ({channel}: Props): JSX.Element => {
    const dispatch = useDispatch();
    const {private_channels: privateChannels} = useGetUsageDeltas();
    const currentPack = useSelector(getCurrentPackName);
    const {isQuotaExceeded, withQuotaCheck} = quotaGate(privateChannels, currentPack);
    const handleConvertToPrivate = () => {
        dispatch(
            openModal({
                modalId: ModalIdentifiers.CONVERT_GM_TO_CHANNEL,
                dialogType: ConvertGmToChannelModal,
                dialogProps: {channel},
            }),
        );
    };

    return (
        <Menu.Item
            id='convertGMPrivateChannel'
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
                        id='sidebar_left.sidebar_channel_menu_convert_to_channel'
                        defaultMessage='Convert to Private Channel'
                    />
                    {isQuotaExceeded && <wc-ksuite-pro-upgrade-tag/>}
                </div>
            }
        />
    );
};

export default React.memo(ConvertGMtoPrivate);
