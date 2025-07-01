import type {FC} from 'react';
import React from 'react';
import './ik_upgrade_banner.css';

const UpgradeBanner: FC = () => {
    return (
        <wc-ksuite-pro-upgrade-banner
            offer='standard'
            class='upgrade-banner'
            variant='chat::history'
        />
    );
};

export default UpgradeBanner;
