// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import {trackEvent} from 'actions/telemetry_actions';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {CreateChannelsTour, InvitePeopleTour, JoinChannelsTour} from 'components/tours/onboarding_tour';
import IntegrationsIcon from 'components/widgets/icons/integrations_icon';
import PlusFilledIcon from 'components/widgets/icons/plus_filled_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {getHistory} from 'utils/browser_history';
import {isDesktopApp} from 'utils/user_agent';

import type {Server} from 'types/store/servers';

type Props = {
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    userGroupsEnabled: boolean;
    showMoreChannelsModal: () => void;
    showCreateUserGroupModal: () => void;
    invitePeopleModal: () => void;
    showNewChannelModal: () => void;
    showCreateCategoryModal: () => void;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    showCreateTutorialTip: boolean;
    showInviteTutorialTip: boolean;
    isAddChannelOpen: boolean;
    openAddChannelOpen: (open: boolean) => void;
    canCreateCustomGroups: boolean;
    server: Server;
};

const AddChannelDropdown = ({
    canCreateChannel,
    canJoinPublicChannel,
    showMoreChannelsModal,
    showCreateUserGroupModal,
    invitePeopleModal,
    showNewChannelModal,
    showCreateCategoryModal,
    handleOpenDirectMessagesModal,
    unreadFilterEnabled,
    showJoinChannelTutorialTip,
    showCreateTutorialTip,
    showInviteTutorialTip,
    isAddChannelOpen,
    openAddChannelOpen,
    canCreateCustomGroups,
}: Props) => {
    const intl = useIntl();
    const isGuestUser = useSelector(isCurrentUserGuestUser);
    const currentTeam = useSelector(getCurrentTeam);

    const goToIntegration = () => {
        getHistory().push(`/${currentTeam.name}/integrations`);
    };

    const renderDropdownItems = () => {
        const invitePeople = (
            <Menu.Group>
                <Menu.ItemAction
                    id='invitePeople'
                    onClick={invitePeopleModal}
                    icon={<i className='icon-account-plus-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.invitePeople', defaultMessage: 'Invite people'})}
                    extraText={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.invitePeopleExtraText', defaultMessage: 'Add people to the team'})}
                />
                {showInviteTutorialTip && <InvitePeopleTour/>}
            </Menu.Group>
        );

        let joinPublicChannel;
        if (canJoinPublicChannel) {
            joinPublicChannel = (
                <Menu.ItemAction
                    id='showMoreChannels'
                    onClick={showMoreChannelsModal}
                    icon={<i className='icon-globe'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.browseChannels', defaultMessage: 'Browse channels'})}
                    sibling={showJoinChannelTutorialTip && <JoinChannelsTour/>}
                />
            );
        }

        let createChannel;
        if (canCreateChannel) {
            createChannel = (
                <Menu.ItemAction
                    id='showNewChannel'
                    onClick={showNewChannelModal}
                    icon={<i className='icon-plus'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createNewChannel', defaultMessage: 'Create new channel'})}
                    sibling={showCreateTutorialTip && <CreateChannelsTour/>}
                />
            );
        }

        let createCategory;
        if (!unreadFilterEnabled) {
            createCategory = (
                <Menu.Group>
                    <Menu.ItemAction
                        id='createCategory'
                        onClick={showCreateCategoryModal}
                        icon={<i className='icon-folder-plus-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createCategory', defaultMessage: 'Create new category'})}
                    />
                </Menu.Group>);
        }

        const createDirectMessage = (
            <Menu.ItemAction
                id={'openDirectMessageMenuItem'}
                onClick={handleOpenDirectMessagesModal}
                icon={<i className='icon-account-outline'/>}
                text={intl.formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'})}
            />
        );

        let createUserGroup;
        if (canCreateCustomGroups) {
            createUserGroup = (
                <Menu.ItemAction
                    id={'createUserGroup'}
                    onClick={showCreateUserGroupModal}
                    icon={<i className='icon-account-multiple-plus-outline'/>}
                    text={intl.formatMessage({id: 'sidebar.createUserGroup', defaultMessage: 'Create New User Group'})}
                />
            );
        }
        const integration = (
            <Menu.ItemAction
                id={'integration'}
                onClick={() => goToIntegration()}
                icon={<IntegrationsIcon/>}
                text={
                    <FormattedMessage
                        id='integrations.header'
                        defaultMessage='Integrations'
                    />}
            />
        );

        return (
            <>
                <Menu.Group>
                    {createChannel}
                    {joinPublicChannel}
                    {createDirectMessage}
                    {/* {showCreateTutorialTip && <CreateAndJoinChannelsTour/>} */}
                    {createUserGroup}
                </Menu.Group>
                {createCategory}
                {!isGuestUser && integration}
                {/* {invitePeople} */}
            </>
        );
    };

    const trackOpen = (opened: boolean) => {
        openAddChannelOpen(opened);
        if (opened) {
            trackEvent('ui', 'ui_add_channel_dropdown_opened');
        }
    };

    if (!(canCreateChannel || canJoinPublicChannel)) {
        return null;
    }

    const tooltip = (
        <Tooltip
            id='new-group-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id={'sidebar_left.add_channel_dropdown.browseOrCreateChannels'}
                defaultMessage='Browse or create channels'
            />
        </Tooltip>
    );

    return (
        <MenuWrapper
            className={classNames('AddChannelDropdown', {isWebApp: !isDesktopApp()})}
            onToggle={trackOpen}
            open={isAddChannelOpen}
        >
            <OverlayTrigger
                delayShow={500}
                placement='top'
                overlay={tooltip}
            >
                <>
                    <button
                        className={'AddChannelDropdown_dropdownButton'}
                        aria-label={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
                    >

                        {isDesktopApp() ? <i className='icon-plus'/> : (
                            <>
                                <PlusFilledIcon/>
                                <FormattedMessage
                                    id={'admin.user_grid.new'}
                                    defaultMessage='New'
                                />
                            </>
                        )}
                    </button>
                </>
            </OverlayTrigger>
            <Menu
                id='AddChannelDropdown'
                ariaLabel={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
            >
                {renderDropdownItems()}
            </Menu>
        </MenuWrapper>
    );
};

export default AddChannelDropdown;
