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
import useGetOs from 'components/common/hooks/useGetOs';

import {AnnouncementBarTypes, ModalIdentifiers} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';
import {isMobile} from 'utils/utils';

const GET_THE_APP_LAST_SEEN_AT = 'GetTheAppLastSeenAt';
const DO_NOT_DISTURB = 'DoNotDisturb';
const COOLDOWN = 172800000; // 48h

const GetAppAnnoucementBar = () => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const os = useGetOs();
    const lastSeenAt = localStorage.getItem(GET_THE_APP_LAST_SEEN_AT);
    const isCooldownExceeded = !isMobile() && Date.now() >= Number(lastSeenAt) + COOLDOWN;
    const shouldDisplayBanner = !isDesktopApp() && (!lastSeenAt || isCooldownExceeded);
    const [show, setShow] = useState<boolean | null>(lastSeenAt === DO_NOT_DISTURB ? null : shouldDisplayBanner);

    const handleClose = (doNotDisturb = false) => {
        localStorage.setItem(GET_THE_APP_LAST_SEEN_AT, doNotDisturb ? DO_NOT_DISTURB : Date.now().toString());
        setShow(null);
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

    if (isMobile()) {
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
