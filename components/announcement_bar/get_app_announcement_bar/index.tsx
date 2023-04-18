// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';

import {openModal} from 'actions/views/modals';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';
import GetTheAppIcon from 'components/widgets/icons/get_the_app_icon';
import GetTheAppModal from 'components/get_the_app_modal';
import GetAppAnnoucementBarMobile from 'components/announcement_bar/get_app_announcement_bar/get_app_annoucement_bar_mobile';
import useGetOperatingSystem from 'components/common/hooks/useGetOperatingSystem';

import {AnnouncementBarTypes, ModalIdentifiers} from 'utils/constants';
import {isDesktopApp, isMobile as getIsMobile} from 'utils/user_agent';

const GET_THE_APP_LAST_SEEN_AT = 'GetTheAppLastSeenAt';
const DO_NOT_DISTURB = 'DoNotDisturb';
const COOLDOWN = 172800000; // 48h

const GetAppAnnoucementBar = () => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const os = useGetOperatingSystem();
    const lastSeenAt = localStorage.getItem(GET_THE_APP_LAST_SEEN_AT);
    const isMobile = getIsMobile();
    const isCooldownExceeded = Date.now() >= Number(lastSeenAt) + COOLDOWN;
    const shouldDisplayDesktopBanner = !isDesktopApp() && !isMobile && (!lastSeenAt || isCooldownExceeded);
    const shouldDisplayMobileModal = isMobile && !lastSeenAt;
    const shouldDisplayMobileBanner = isMobile && Boolean(lastSeenAt);
    const [show, setShow] = useState(lastSeenAt !== DO_NOT_DISTURB && (shouldDisplayDesktopBanner || shouldDisplayMobileModal || shouldDisplayMobileBanner));

    const handleClose = (doNotDisturb = false) => {
        localStorage.setItem(GET_THE_APP_LAST_SEEN_AT, doNotDisturb ? DO_NOT_DISTURB : Date.now().toString());
        setShow(false);
    };

    const message = formatMessage({
        id: 'get_the_app_announcement_bar.message',
        defaultMessage: '<gta>Download the kChat application</gta> for {os} for a better experience ! (<dnd>Don’t remind me again</dnd>)',
    }, {
        gta: (chunks) => (
            <a
                href='https://infomaniak.com/gtl/apps.kchat'
                target='_blank'
                rel='noopener noreferrer'
            >
                {chunks}
            </a>
        ),
        os,
        dnd: (chunks) => (
            <a onClick={() => handleClose(true)}>
                {chunks}
            </a>
        ),
    });

    if (!show) {
        return null;
    }

    if (shouldDisplayMobileModal) {
        dispatch(openModal({
            modalId: ModalIdentifiers.GET_THE_APP,
            dialogType: GetTheAppModal,
            dialogProps: {
                onClose: handleClose,
            },
        }));
        setShow(false);
        return null;
    }

    if (shouldDisplayMobileBanner) {
        return (
            <GetAppAnnoucementBarMobile onClose={handleClose}/>
        );
    }

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.INFOMANIAK}
            handleClose={handleClose}
            showCloseButton={true}
            message={message}
            icon={<GetTheAppIcon className='announcement-bar__ik-icon'/>}
            isStringContainingUrl={true}
        />
    );
};

export default GetAppAnnoucementBar;