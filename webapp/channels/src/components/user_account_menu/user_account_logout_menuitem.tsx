// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {LogoutMessageKey, type KSuiteBridge} from '@infomaniak/ksuite-bridge';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ExitToAppIcon} from '@infomaniak/compass-icons/components';

import {emitUserLoggedOutEvent} from 'actions/global_actions';

import * as Menu from 'components/menu';

export interface Props {
    ksuiteBridge: KSuiteBridge;
    isBridgeConnected: boolean;
}

export default function UserAccountLogoutMenuItem(props: Props) {
    function handleClick() {
        if (props.isBridgeConnected) {
            props.ksuiteBridge.sendMessage({
                type: LogoutMessageKey,
            });
        }
        emitUserLoggedOutEvent('ikLogout');
    }

    return (
        <Menu.Item
            leadingElement={
                <ExitToAppIcon
                    size={18}
                    aria-hidden='true'
                />
            }
            labels={
                <FormattedMessage
                    id='userAccountMenu.logoutMenuItem.label'
                    defaultMessage='Log out'
                />
            }
            onClick={handleClick}
        />
    );
}
