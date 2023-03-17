// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';
import GetTheAppIcon from 'components/widgets/icons/get_the_app_icon';

import {AnnouncementBarTypes} from 'utils/constants';
import {isLinux, isWindows} from 'utils/user_agent';

const GET_THE_APP_LAST_SEEN_AT = 'GetTheAppLastSeenAt';
const DO_NOT_DISTURB = 'DoNotDisturb';
const COOLDOWN = 172800000; // 48h

const GetAppAnnoucementBar = () => {
    const {formatMessage} = useIntl();
    const [show, setShow] = useState(false);

    useEffect(() => {
        const lastSeenAt = localStorage.getItem(GET_THE_APP_LAST_SEEN_AT);
        const shouldDisplayBanner = !lastSeenAt || Date.now() >= Number(lastSeenAt) + COOLDOWN;
        if (lastSeenAt !== DO_NOT_DISTURB && shouldDisplayBanner) {
            setShow(true);
        }
    }, []);

    const handleClose = (doNotDisturb = false) => {
        localStorage.setItem(GET_THE_APP_LAST_SEEN_AT, doNotDisturb ? DO_NOT_DISTURB : Date.now().toString());
        setShow(false);
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
