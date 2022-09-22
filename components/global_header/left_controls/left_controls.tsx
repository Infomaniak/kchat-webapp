// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-nested-ternary */

import React, {useState} from 'react';
import styled from 'styled-components';

import {useDispatch, useSelector} from 'react-redux';

import {isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import SidebarHeader from 'components/sidebar/sidebar_header';
import MobileSidebarHeader from 'components/sidebar/mobile_sidebar_header';
import {isDesktopApp} from 'utils/user_agent';

// import AppNameDisplay from 'components/app_name_display';
import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import CreateUserGroupsModal from 'components/create_user_groups_modal';
import MoreChannels from 'components/more_channels';
import {ModalIdentifiers} from 'utils/constants';
import NewChannelModal from 'components/new_channel_modal/new_channel_modal';

import InvitationModal from 'components/invitation_modal';

import EditCategoryModal from 'components/edit_category_modal';

import {getIsMobileView} from 'selectors/views/browser';
import {isUnreadFilterEnabled as getIsUnreadFilterEnabled} from 'selectors/views/channel_sidebar';

import {haveISystemPermission} from 'packages/mattermost-redux/src/selectors/entities/roles_helpers';
import {Permissions} from 'packages/mattermost-redux/src/constants';
import {haveICurrentChannelPermission} from 'packages/mattermost-redux/src/selectors/entities/roles';

import {getCurrentTeamId} from 'packages/mattermost-redux/src/selectors/entities/teams';

import HistoryButtons from './history_buttons';

const LeftControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 46px;
    flex-shrink: 0;
    width: 240px;
    background: var(--sidebar-bg);
    border-bottom: solid 1px rgba(var(--sidebar-text-rgb), 0.25);
    padding-left: 10px;

    > * + * {
        margin-left: 10px;
    }
`;

const LeftControls = (): JSX.Element => {
    const [showDirectChannelsModal, setShowDirectChannelsModal] = useState(false);
    const isMobileView = useSelector(getIsMobileView);
    const unreadFilterEnabled = useSelector(getIsUnreadFilterEnabled);
    const userGroupsEnabled = useSelector(isCustomGroupsEnabled);
    const canCreateCustomGroups = useSelector((state) => haveISystemPermission(state, {permission: Permissions.CREATE_CUSTOM_GROUP}));
    const canJoinPublicChannel = useSelector((state) => haveICurrentChannelPermission(state, Permissions.JOIN_PUBLIC_CHANNELS));
    const canCreatePublicChannel = useSelector((state) => haveICurrentChannelPermission(state, Permissions.CREATE_PUBLIC_CHANNEL));
    const canCreatePrivateChannel = useSelector((state) => haveICurrentChannelPermission(state, Permissions.CREATE_PRIVATE_CHANNEL));
    const teamId = useSelector(getCurrentTeamId);
    const dispatch = useDispatch();
    const showNewChannelModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.NEW_CHANNEL_MODAL,
            dialogType: NewChannelModal,
        }));
        trackEvent('ui', 'ui_channels_create_channel_v2');
    };
    const showMoreChannelsModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.MORE_CHANNELS,
            dialogType: MoreChannels,
            dialogProps: {morePublicChannelsModalType: 'public'},
        }));
        trackEvent('ui', 'ui_channels_more_public_v2');
    };
    const showCreateUserGroupModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
        }));
        trackEvent('ui', 'ui_channels_create_user_group');
    };
    const invitePeopleModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.INVITATION,
            dialogType: InvitationModal,
        }));
        trackEvent('ui', 'ui_channels_dropdown_invite_people');
    };
    const showCreateCategoryModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        }));
        trackEvent('ui', 'ui_sidebar_menu_createCategory');
    };
    const handleOpenMoreDirectChannelsModal = (e: Event) => {
        e.preventDefault();
        if (showDirectChannelsModal) {
            setShowDirectChannelsModal(false);
        } else {
            setShowDirectChannelsModal(true);
        }
    };

    return (
        <LeftControlsContainer>
            {/* <ProductMenu/> */}
            {/* <AppNameDisplay/> */}
            {/* eslint-disable-next-line no-negated-condition */}
            {!teamId ? (<div/>) : isMobileView ? <MobileSidebarHeader/> : (
                <SidebarHeader
                    showNewChannelModal={showNewChannelModal}
                    showMoreChannelsModal={showMoreChannelsModal}
                    showCreateUserGroupModal={showCreateUserGroupModal}
                    invitePeopleModal={invitePeopleModal}
                    showCreateCategoryModal={showCreateCategoryModal}
                    canCreateChannel={canCreatePrivateChannel || canCreatePublicChannel}
                    canJoinPublicChannel={canJoinPublicChannel}
                    handleOpenDirectMessagesModal={handleOpenMoreDirectChannelsModal}
                    unreadFilterEnabled={unreadFilterEnabled}
                    userGroupsEnabled={userGroupsEnabled}
                    canCreateCustomGroups={canCreateCustomGroups && userGroupsEnabled}
                />
            )}
            {isDesktopApp() && <HistoryButtons/>}
        </LeftControlsContainer>
    );
};

export default LeftControls;
