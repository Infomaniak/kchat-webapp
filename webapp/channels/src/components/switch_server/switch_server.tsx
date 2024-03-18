// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import classNames from 'classnames';
import React, {memo, useState} from 'react';
import type {FC} from 'react';
import './switch_server.scss';

import type {BasicUnreadStatus} from 'mattermost-redux/selectors/entities/channels';

import type {Server} from 'types/store/servers';

import SwitchItem from './switch_item';

type Props = {
    currentServer: Server;
    unreadStatus: BasicUnreadStatus;
    servers: Server[];
    isMultiServer: boolean;
}

const SwitchServer: FC<Props> = ({currentServer, unreadStatus, servers, isMultiServer}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const handleToggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div
            id='switch-server'
            className={classNames('switch-server-dropdown', {open: isOpen})}
        >
            <div className='bordered'>
                <SwitchItem
                    server={currentServer}
                    isCurrentServer={true}
                    onClick={handleToggleDropdown}
                    displayArrowIcon={isMultiServer}
                    isDropdownOpen={isOpen}
                    displayUnreadDot={Boolean(unreadStatus)}
                />
                {isMultiServer && isOpen && (
                    <div className='list'>
                        {servers.map((server, idx) => (
                            <SwitchItem
                                key={idx}
                                server={server}
                                isCurrentServer={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(SwitchServer);
