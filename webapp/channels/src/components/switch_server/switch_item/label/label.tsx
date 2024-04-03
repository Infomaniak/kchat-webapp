// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import type {FC} from 'react';

import ChatIcon from 'components/widgets/icons/chat_icon';
import ChatUnreadIcon from 'components/widgets/icons/chat_unread_icon';
import MaintenanceIcon from 'components/widgets/icons/maintenance_icon';
import WarningIcon from 'components/widgets/icons/warning_icon';

import {ServerStatus} from 'utils/constants';

import type {Server} from 'types/store/servers';

type Props = {
    name: string;
    isCurrentTeam: boolean;
    displayUnreadDot?: boolean;
    status: Server['status'];
}

const Label: FC<Props> = ({name, isCurrentTeam, displayUnreadDot, status}) => {
    const renderIcon = () => {
        switch (true) {
        case status === ServerStatus.LOCKED:
            return <WarningIcon/>;
        case status === ServerStatus.MAINTENANCE:
            return <MaintenanceIcon/>;
        case Boolean(isCurrentTeam && displayUnreadDot):
            return <ChatUnreadIcon/>;
        default:
            return <ChatIcon color={isCurrentTeam ? '#4CB7FF' : ''}/>;
        }
    };

    return (
        <span
            className={classNames('team-label', {hasDot: isCurrentTeam && displayUnreadDot})}
        >
            {renderIcon()}
            {name}</span>
    );
};

export default Label;
