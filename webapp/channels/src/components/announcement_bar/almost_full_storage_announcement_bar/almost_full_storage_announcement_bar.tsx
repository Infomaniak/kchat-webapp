// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import {getNextWcPack, openUpgradeDialog} from 'mattermost-redux/utils/plans_util';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';
import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import AlertSvg from 'components/common/svg_images_components/alert_svg';

import {AnnouncementBarTypes} from 'utils/constants';
import {getShopUrl} from 'utils/utils';

type Props = {
    userIsAdmin: boolean;
    isDiscarded: boolean;

    actions: {
        saveDismissedState: (isDismissed: boolean) => void;
    };
}

const TRESHOLD_ALMOST_FULL = -1073741824; // 1Gb, 1024b-based

export function AlmostFullStorageAnnouncementBar({userIsAdmin, actions, isDiscarded}: Props) {
    const {storage} = useGetUsageDeltas();
    const currentPack = useSelector(getCurrentPackName);
    const nextPack = getNextWcPack(currentPack);

    const isEssential = currentPack === 'ksuite_essential';

    const handleCTA = () => {
        if (isEssential) {
            openUpgradeDialog(nextPack);
        } else {
            window.open(getShopUrl(), '_blank');
        }
    };

    const isFull = storage >= 0;
    const isAlmostFull = !isFull && storage >= TRESHOLD_ALMOST_FULL;

    if (!isAlmostFull && !isDiscarded) {
        return null;
    }

    const message = () => {
        if (userIsAdmin) {
            return (
                <FormattedMessage
                    id='almost_full_storage_announcement_bar.message.admin'
                    defaultMessage="You're about to reach your storage limit. To keep working without interruption, <modifyOffer>upgrade your plan</modifyOffer> to get more storage and new features."
                    values={{
                        modifyOffer: (chunks) => (
                            <button
                                className='almost_full_storage_announcement_bar__upgrade-offer'
                                onClick={handleCTA}
                            >{chunks}</button>
                        ),
                    }}
                />
            );
        }
        return (
            <FormattedMessage
                id='almost_full_storage_announcement_bar.message'
                defaultMessage="You're about to reach your storage limit. To keep working without interruption, contact an administrator to upgrade."
            />
        );
    };

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.WARNING}
            showCloseButton={true}
            handleClose={() => actions.saveDismissedState(true)}
            message={message()}
            icon={(
                <AlertSvg
                    width={18}
                    height={18}
                />
            )}
            showCTA={false}
            showLinkAsButton={false}

        />
    );
}

