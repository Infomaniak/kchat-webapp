// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';

import loaderkChat from 'images/logo_compact.png';
import {AnnouncementBarTypes} from 'utils/constants';

import './get_app_annoucement_bar_mobile.scss';

type Props = {
    onClose: (doNotDisturb?: boolean) => void;
};

const GetAppAnnoucementBarMobile = ({onClose}: Props) => {
    const handleClose = () => onClose(true);

    const handleDownload = () => {
        window.open('https://infomaniak.com/gtl/apps.kchat?appredirect=true', '_blank', 'noopener,noreferrer');
        handleClose();
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
