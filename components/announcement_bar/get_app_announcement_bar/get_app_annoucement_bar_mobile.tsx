// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';

import {isSafari} from 'utils/user_agent';
import {AnnouncementBarTypes} from 'utils/constants';

import loaderkChat from 'images/logo_compact.png';

import './get_app_annoucement_bar_mobile.scss';

type Props = {
    onClose: (doNotDisturb?: boolean) => void;
};

const GetAppAnnoucementBarMobile = ({onClose}: Props) => {
    const handleClose = (doNotDisturb?: boolean) => onClose(doNotDisturb);

    const handleDownload = () => {
        window.open('https://infomaniak.com/gtl/apps.kchat', '_blank', 'noopener,noreferrer');
        handleClose(true);
    };

    const icon = (
        <div className='get-app-annoucement-bar-mobile-header'>
            <img
                className='get-app-annoucement-bar-mobile-header__logo'
                src={loaderkChat}
                alt='kchat logo'
            />
            <div className='get-app-annoucement-bar-mobile-header__title'>
                {'Infomaniak kChat'}
                <span className='get-app-annoucement-bar-mobile-header__product'>
                    {'Infomaniak Network SA'}
                </span>
            </div>
        </div>
    );

    const button = (
        <a onClick={handleDownload}>
            <FormattedMessage
                id='get_app_annoucement_bar_mobile.download'
                defaultMessage='Download'
            />
        </a>
    );

    // Smart banner is already displayed
    // https://developer.apple.com/documentation/webkit/promoting_apps_with_smart_app_banners
    if (isSafari()) {
        return null;
    }

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.INFOMANIAK_MOBILE}
            showCloseButton={true}
            handleClose={handleClose}
            icon={icon}
            message={button}
        />
    );
};

export default GetAppAnnoucementBarMobile;
