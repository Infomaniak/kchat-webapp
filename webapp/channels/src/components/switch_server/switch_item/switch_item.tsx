// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DotsVerticalIcon} from '@infomaniak/compass-icons/components';
import classNames from 'classnames';
import React, {useCallback} from 'react';
import type {FC} from 'react';
import {FormattedMessage} from 'react-intl';

import {setLastKSuiteSeenCookie} from 'mattermost-redux/utils/team_utils';

import * as Menu from 'components/menu';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import IntegrationsIcon from 'components/widgets/icons/integrations_icon';

import {getHistory} from 'utils/browser_history';
import {ServerStatus} from 'utils/constants';
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

const SwitchItem: FC<Props> = ({server, isCurrentServer, unreadCounts, displayArrowIcon, displayUnreadDot, isDropdownOpen, disabled, actions, onClick}) => {
    const goToIntegration = () => getHistory().push(`/${server.name}/integrations`);

    const handleSwitchTeam = () => {
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
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
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
        </OverlayTrigger>
    );
};

export default SwitchItem;
