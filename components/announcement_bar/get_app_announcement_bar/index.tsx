// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';

import {openModal} from 'actions/views/modals';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';
import GetTheAppIcon from 'components/widgets/icons/get_the_app_icon';
import GetTheAppModal from 'components/get_the_app_modal';
import GetAppAnnoucementBarMobile from 'components/announcement_bar/get_app_announcement_bar/get_app_annoucement_bar_mobile';

import {AnnouncementBarTypes, ModalIdentifiers} from 'utils/constants';
import {isLinux, isMobileWebviewApp, isWindows} from 'utils/user_agent';
import {isMobile} from 'utils/utils';

const GET_THE_APP_LAST_SEEN_AT = 'GetTheAppLastSeenAt';
const DO_NOT_DISTURB = 'DoNotDisturb';
const COOLDOWN = 172800000; // 48h

const GetAppAnnoucementBar = () => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const [show, setShow] = useState<boolean | null>(null);

    useEffect(() => {
        const lastSeenAt = localStorage.getItem(GET_THE_APP_LAST_SEEN_AT);
        const shouldDisplayBanner = !lastSeenAt || (!isMobile() && Date.now() >= Number(lastSeenAt) + COOLDOWN);
        if (lastSeenAt !== DO_NOT_DISTURB) {
            if (shouldDisplayBanner) {
                // Show banner (or modal on mobile)
                // Desktop: every 48 hours
                // Mobile: only if lastSeenAt is not defined as we show it only once
                setShow(true);
            } else {
                // Desktop: display nothing
                // Mobile: show banner
                setShow(false);
            }
        }
    }, []);

    const handleClose = (doNotDisturb = false) => {
        localStorage.setItem(GET_THE_APP_LAST_SEEN_AT, doNotDisturb ? DO_NOT_DISTURB : Date.now().toString());
        setShow(null);
    };

    // Set default OS as Mac
    let os = 'Mac OS';
    if (isWindows()) {
        os = 'Windows';
    } else if (isLinux()) {
        os = 'Linux';
    }

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

    if (isMobile()) {
        // Don't display the banner or modal on mobile app
        if (isMobileWebviewApp()) {
            return null;
        }
        if (show) {
            dispatch(openModal({
                modalId: ModalIdentifiers.GET_THE_APP,
                dialogType: GetTheAppModal,
                dialogProps: {
                    onClose: handleClose,
                },
            }));
            setShow(null);
            return null;
        }
        if (show === false) {
            return (
                <GetAppAnnoucementBarMobile onClose={handleClose}/>
            );
        }
    }

    if (!show) {
        return null;
    }

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.INFOMANIAK}
            handleClose={handleClose}
            showCloseButton={true}
            message={message}
            icon={<GetTheAppIcon/>}
        />
    );
};

export default GetAppAnnoucementBar;
