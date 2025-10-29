// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import {getNextWcPack, openUpgradeDialog} from 'mattermost-redux/utils/plans_util';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';
import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';

import {AnnouncementBarTypes} from 'utils/constants';
import {getShopUrl} from 'utils/utils';

type Props = {
    userIsAdmin: boolean;
}

export function FullStorageAnnouncementBar({userIsAdmin}: Props) {
    const {storage} = useGetUsageDeltas();
    const currentPack = useSelector(getCurrentPackName);
    const nextPack = getNextWcPack(currentPack);

    const isFull = storage >= 0;

    if (!isFull) {
        return null;
    }

    const isEssential = currentPack === 'ksuite_essential';

    const handleCTA = () => {
        if (isEssential) {
            openUpgradeDialog(nextPack);
        } else {
            window.open(getShopUrl(), '_blank');
        }
    };

    const message = () => {
        if (userIsAdmin) {
            return (
                <FormattedMessage
                    id='full_storage_announcement_bar.message.admin'
                    defaultMessage='You have reached your storage limit. <modifyOffer>Upgrade your plan</modifyOffer> to get more storage and new features.'
                    values={{
                        modifyOffer: (chunks) => (
                            <button
                                className='full_storage_announcement_bar__upgrade-offer'
                                onClick={handleCTA}
                            >{chunks}</button>
                        ),
                    }}
                />
            );
        }
        return (
            <FormattedMessage
                id='full_storage_announcement_bar.message'
                defaultMessage='You have reached your storage limit. Contact an administrator to upgrade.'
            />
        );
    };

    return (
        <AnnouncementBar
            showCloseButton={false}
            type={AnnouncementBarTypes.CRITICAL}
            message={message()}
            icon={(
                <i className='icon icon-alert-outline'/>
            )}
            showCTA={false}
            showLinkAsButton={false}

        />
    );
}

