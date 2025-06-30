import type {FC} from 'react';
import React from 'react';
import './ik_upgrade_banner.css';

const UpgradeBanner: FC = () => {
    return (
        <wc-ksuite-pro-upgrade-banner
            class='upgrade-banner'
            head-band-type='button'
        />
    );
};

export default UpgradeBanner;
