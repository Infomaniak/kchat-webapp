// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {openModal} from 'actions/views/modals';
import {getAnnouncementBarCount} from 'selectors/views/announcement_bar';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';
import GetAppAnnoucementBarMobile from 'components/announcement_bar/get_app_announcement_bar/get_app_annoucement_bar_mobile';
import useGetOperatingSystem from 'components/common/hooks/useGetOperatingSystem';
import ExternalLink from 'components/external_link';
import GetTheAppModal from 'components/get_the_app_modal';
import GetTheAppIcon from 'components/widgets/icons/get_the_app_icon';

import {AnnouncementBarTypes, ModalIdentifiers} from 'utils/constants';
import {isDesktopApp, isMobile as getIsMobile} from 'utils/user_agent';

const GET_THE_APP_LAST_SEEN_AT = 'GetTheAppLastSeenAt';
const DO_NOT_DISTURB = 'DoNotDisturb';
const COOLDOWN = 172800000; // 48h

const GetAppAnnoucementBar = () => {
    const dispatch = useDispatch();
    const announcementBarCount = useSelector(getAnnouncementBarCount);
    const {formatMessage} = useIntl();
    const os = useGetOperatingSystem();
    const lastSeenAt = localStorage.getItem(GET_THE_APP_LAST_SEEN_AT) || 1;
    const isMobile = getIsMobile();
    const isCooldownExceeded = Date.now() >= Number(lastSeenAt) + COOLDOWN;
    const shouldDisplayDesktopBanner = !isDesktopApp() && !isMobile && (!lastSeenAt || isCooldownExceeded);
    const shouldDisplayMobileModal = isMobile && !lastSeenAt;
    const shouldDisplayMobileBanner = isMobile && Boolean(lastSeenAt);
    const shouldShow = lastSeenAt !== DO_NOT_DISTURB && (shouldDisplayDesktopBanner || shouldDisplayMobileModal || shouldDisplayMobileBanner);
    const [show, setShow] = useState(shouldShow);

    const handleClose = (doNotDisturb = false) => {
        localStorage.setItem(GET_THE_APP_LAST_SEEN_AT, doNotDisturb ? DO_NOT_DISTURB : Date.now().toString());
        setShow(false);
    };

    const message = formatMessage({
        id: 'get_the_app_announcement_bar.message',
        defaultMessage: '<gta>Download the kChat application</gta> for {os} for a better experience ! (<dnd>Don’t remind me again</dnd>)',
    }, {
        gta: (chunks) => (
            <ExternalLink href='https://infomaniak.com/gtl/apps.kchat'>
                {chunks}
            </ExternalLink>
        ),
        os,
        dnd: (chunks) => (
            <a onClick={() => handleClose(true)}>
                {chunks}
            </a>
        ),
    });

    const shouldDisplayBanner = show || (shouldShow && !announcementBarCount);

    if (!shouldDisplayBanner || announcementBarCount > 1) {
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
