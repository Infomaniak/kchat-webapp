// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {isDesktopApp} from 'utils/user_agent';

import InfomaniakLogo from 'images/ik/infomaniak.svg';
import kchatLogo from 'images/logo_compact.png';
import './ik_app_branding.scss';

const APP_NAME = 'kChat';

const IKAppBranding = (): JSX.Element => (
    <div className='ik-app-branding'>
        <img
            className='ik-app-branding__logo'
            src={kchatLogo}
            alt='kChat logo'
        />
        {!isDesktopApp() && (
            <span className='ik-app-branding__title'>
                <img
                    src={InfomaniakLogo}
                    alt='Infomaniak'
                />
                <span className='ik-app-branding__name'>
                    {APP_NAME}
                </span>
            </span>
        )}
    </div>
);

export default IKAppBranding;
