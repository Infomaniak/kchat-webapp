// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';

import {isSafari} from 'utils/user_agent';
import {AnnouncementBarTypes} from 'utils/constants';

import loaderkChat from 'images/logo_compact.png';

import './get_app_annoucement_bar_mobile.scss';

const redirectToShop = () => window.open('https://infomaniak.com/gtl/apps.kchat', '_blank', 'noopener,noreferrer');

const GetAppAnnoucementBarMobile = () => {
    const [show, setShow] = useState<boolean>(true);

    const handleClose = () => {
        setShow(false);
    };

    const icon = (
        <div className='get-app-annoucement-bar-mobile-header'>
            <img
                className='get-app-annoucement-bar-mobile-header__logo'
                src={loaderkChat}
                alt='kchat logo'
            />
            <div className='get-app-annoucement-bar-mobile-header__title'>
                {'Infomaniak'}
                <span className='get-app-annoucement-bar-mobile-header__product'>
                    {'kChat'}
                </span>
            </div>
        </div>
    );

    const button = (
        <button
            className='btn btn-primary'
            onClick={redirectToShop}
        >
            <FormattedMessage
                id='get_app_annoucement_bar_mobile.download'
                defaultMessage='Télécharger{br}l’application'
                values={{
                    br: <br/>,
                }}
            />
        </button>
    );

    if (!show) {
        return null;
    }

    // Use smart banners on safari
    if (isSafari()) {
        const smartBanner = document.createElement('meta');
        smartBanner.name = 'apple-itunes-app';
        smartBanner.content = 'app-id=6443845553';
        document.head.appendChild(smartBanner);
        setShow(false);
        return null;
    }

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.INFOMANIAK}
            showCloseButton={true}
            handleClose={handleClose}
            icon={icon}
            message={button}
        />
    );
};

export default GetAppAnnoucementBarMobile;
