import React from 'react';
import './ik_upgrade_banner.css';

import type {PackName} from '@mattermost/types/teams';

import type {PropsFromRedux} from './index';

const packNameThatShowsUpgrade: PackName[] = ['ksuite_essential'];
export default function UpgradeBanner({packName}: PropsFromRedux) {
    const shouldHideBanner = !packName || !packNameThatShowsUpgrade.includes(packName);
    if (shouldHideBanner) {
        return null;
    }

    //TODO: use the correct plan to setup the message correctly
    return (
        <div className='upgrade-banner-placeholder'>
            Placeholder WC-BANNER
        </div>
    );
}
