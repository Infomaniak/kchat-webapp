// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {isDesktopApp} from 'utils/user_agent';

import SidebarBrowseOrAddChannelMenu from './sidebar_browse_or_add_channel_menu';

import './sidebar_header.scss';

export type Props = {
    showNewChannelModal: () => void;
    showMoreChannelsModal: () => void;
    showCreateUserGroupModal: () => void;
    invitePeopleModal: () => void;
    showCreateCategoryModal: () => void;
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    handleOpenDirectMessagesModal: () => void;
    unreadFilterEnabled: boolean;
    canCreateCustomGroups: boolean;
}

const SidebarHeader = (props: Props) => {
    const currentTeam = useSelector(getCurrentTeam);

    if (!currentTeam) {
        return null;
    }

    return (
        <header className='sidebarHeaderContainer'>
            {isDesktopApp() && (
                <button
                    className='style--none sidebar-header'
                    type='button'
                    id='sidebarDropdownMenuButton'
                    disabled={true}
                >
                    <span className='title'>{currentTeam.display_name}</span>
                </button>
            )}
            {(props.canCreateChannel || props.canJoinPublicChannel) && (
                <SidebarBrowseOrAddChannelMenu
                    canCreateChannel={props.canCreateChannel}
                    onCreateNewChannelClick={props.showNewChannelModal}
                    canJoinPublicChannel={props.canJoinPublicChannel}
                    onBrowseChannelClick={props.showMoreChannelsModal}
                    onOpenDirectMessageClick={props.handleOpenDirectMessagesModal}
                    canCreateCustomGroups={props.canCreateCustomGroups}
                    onCreateNewUserGroupClick={props.showCreateUserGroupModal}
                    unreadFilterEnabled={props.unreadFilterEnabled}
                    onCreateNewCategoryClick={props.showCreateCategoryModal}
                />
            )}
        </header>
    );
};

export default SidebarHeader;
