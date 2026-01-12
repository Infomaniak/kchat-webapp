// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useCallback} from 'react';
import type {FC} from 'react';
import {FormattedMessage} from 'react-intl';

import {setLastKSuiteSeenCookie} from 'mattermost-redux/utils/team_utils';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import {ServerStatus} from 'utils/constants';

import type {Server} from 'types/store/servers';

import Counter from './counter';
import Label from './label';

import type {PropsFromRedux} from '.';

type Props = PropsFromRedux & {
    server: Server;
    isCurrentServer: boolean;
    disabled?: boolean;
    unreadCounts?: number;
    displayArrowIcon?: boolean;
    displayUnreadDot?: boolean;
    isDropdownOpen?: boolean;
    onClick?: () => void;
}

const SwitchItem: FC<Props> = ({server, isCurrentServer, unreadCounts, displayArrowIcon, displayUnreadDot, isDropdownOpen, disabled, actions, onClick}) => {
    const handleSwitchTeam = () => {
        actions.bridgeRecreate(server.url);
        actions.switchTeam(server.url, server);
        setLastKSuiteSeenCookie(server.id);
        window.location.href = server.url;
    };

    const renderTooltip = useCallback(() => {
        if (server.status === ServerStatus.OK) {
            return <></>;
        }

        return (
            <Tooltip
                id='switch-server-tooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id={`switch_server.tooltip.${server.status}`}
                    defaultMessage={server.status === ServerStatus.LOCKED ? 'Product expired' : 'Maintenance in progress'}
                    values={{product: server.display_name}}
                />
            </Tooltip>
        );
    }, [server.display_name, server.status]);

    return (
        <OverlayTrigger
            trigger={['hover']}
            placement='right'
            overlay={renderTooltip()}
        >
            <div
                className={classNames('switch-item', {isCurrent: isCurrentServer, disabled})}
                {...(disabled ? {} : {onClick: isCurrentServer ? onClick : handleSwitchTeam})}
            >
                <Label
                    status={server.status}
                    name={server.display_name}
                    isCurrentTeam={isCurrentServer}
                    displayUnreadDot={displayUnreadDot}
                />
                { displayArrowIcon && (
                    <i
                        className={classNames('icon icon-chevron-down', {rotate: isDropdownOpen})}
                    />
                )}
                {!isCurrentServer && Boolean(unreadCounts) && <Counter total={unreadCounts}/>}
            </div>
        </OverlayTrigger>
    );
};

export default SwitchItem;
