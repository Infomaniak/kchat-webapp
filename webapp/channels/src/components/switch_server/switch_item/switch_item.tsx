// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DotsVerticalIcon} from '@infomaniak/compass-icons/components';
import classNames from 'classnames';
import React from 'react';
import type {FC} from 'react';
import {FormattedMessage} from 'react-intl';

import {setLastKSuiteSeenCookie} from 'mattermost-redux/utils/team_utils';

import * as Menu from 'components/menu';
import IntegrationsIcon from 'components/widgets/icons/integrations_icon';

import {getHistory} from 'utils/browser_history';
import {localizeMessage} from 'utils/utils';

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

const SwitchItem: FC<Props> = ({server, isCurrentServer, unreadCounts, displayArrowIcon, displayUnreadDot, isDropdownOpen, disabled, onClick, actions}) => {
    const goToIntegration = () => getHistory().push(`/${server.name}/integrations`);

    const handleSwitchTeam = () => {
        actions.switchTeam(server.url, server);
        setLastKSuiteSeenCookie(server.id);
        window.location.href = server.url;
    };

    return (
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
            {isCurrentServer && <div className='icons'>
                <Menu.Container
                    menuButton={{
                        id: 'SidebarCategoryMenu-Button',
                        'aria-label': localizeMessage('integrations.header', 'Integrations'),
                        class: 'SidebarMenu_menuButton',
                        children: <DotsVerticalIcon size={16}/>,
                    }}
                    menuButtonTooltip={{
                        id: 'SidebarCategoryMenu-ButtonTooltip',
                        text: localizeMessage('integrations.header', 'Integrations'),
                        class: 'hidden-xs',
                    }}
                    menu={{
                        id: 'integrations',
                        'aria-label': localizeMessage('sidebar_left.sidebar_category_menu.dropdownAriaLabel', 'Integrations'),
                    }}
                >
                    <Menu.Item
                        id={'integration'}
                        onClick={() => goToIntegration()}
                        leadingElement={
                            <IntegrationsIcon/>
                        }
                        labels={
                            <FormattedMessage
                                id='integrations.header'
                                defaultMessage='Integrations'
                            />
                        }
                    />
                </Menu.Container>
            </div>}
            { displayArrowIcon && (
                <i
                    className={classNames('icon icon-chevron-down', {rotate: isDropdownOpen})}
                />
            )}
            {!isCurrentServer && Boolean(unreadCounts) && <Counter total={unreadCounts}/>}
        </div>
    );
};

export default SwitchItem;
