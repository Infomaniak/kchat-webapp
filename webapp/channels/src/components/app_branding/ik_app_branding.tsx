// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {isDesktopApp} from 'utils/user_agent';

import kchatLogo from 'images/logo_compact.png';
import './ik_app_branding.scss';

const IKAppBranding = (): JSX.Element => {
    if (isDesktopApp()) {
        return (
            <div className='ik-app-branding'>
                <img
                    className='ik-app-branding__logo'
                    src={kchatLogo}
                    alt='kChat logo'
                />
            </div>
        );
    }

    return (
        <module-header-title-component
            mode='app'
            theme='kchat'
        />
    );
};

export default IKAppBranding;
