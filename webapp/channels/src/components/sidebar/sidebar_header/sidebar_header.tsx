// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Heading from '@infomaniak/compass-components/components/heading';
import Flex from '@infomaniak/compass-components/utilities/layout/Flex';
import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {setAddChannelDropdown} from 'actions/views/add_channel_dropdown';
import {isAddChannelDropdownOpen} from 'selectors/views/add_channel_dropdown';

import MainMenu from 'components/main_menu';
import OverlayTrigger from 'components/overlay_trigger';
import AddChannelDropdown from 'components/sidebar/add_channel_dropdown';
import Tooltip from 'components/tooltip';
import {OnboardingTourSteps} from 'components/tours';
import {useShowOnboardingTutorialStep} from 'components/tours/onboarding_tour';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

type SidebarHeaderContainerProps = {
    id?: string;
}

type SidebarHeaderProps = Record<string, unknown>;

const SidebarHeaderContainer = styled(Flex).attrs(() => ({
    element: 'header',
    row: true,
    justify: 'space-between',
    alignment: 'center',
}))<SidebarHeaderContainerProps>`
    height: 46px;
    width: 100%;
    padding: 0 16px !important;

    .dropdown-menu {
        position: absolute;
        transform: translate(0, 0);
        margin-left: 0;
        min-width: 210px;
    }

    #SidebarContainer & .AddChannelDropdown_dropdownButton {
        border-radius: 16px;
        font-size: 18px;
    }
`;

const HEADING_WIDTH = 200;
const CHEVRON_WIDTH = 26;
const ADD_CHANNEL_DROPDOWN_WIDTH = 28;
const TITLE_WIDTH = (HEADING_WIDTH - CHEVRON_WIDTH - ADD_CHANNEL_DROPDOWN_WIDTH).toString();

const SidebarHeading = styled(Heading).attrs(() => ({
    element: 'h1',
    margin: 'none',
    size: 200,
}))<SidebarHeaderProps>`
    color: var(--sidebar-header-text-color) !important;
    cursor: pointer;
    display: flex;

    .title {
        max-width: ${TITLE_WIDTH}px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
    }

    .icon-chevron-down {
        margin-left: -3px;
        margin-right: -1px;
    }

    #SidebarContainer & {
        font-family: SuisseIntl, sans-serif;
    }
`;

export type Props = {
    showNewChannelModal: () => void;
    showMoreChannelsModal: () => void;
    showCreateUserGroupModal: () => void;
    invitePeopleModal: () => void;
    showCreateCategoryModal: () => void;
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    userGroupsEnabled: boolean;
    canCreateCustomGroups: boolean;
    showWorkTemplateButton: boolean;
}

const SidebarHeader: React.FC<Props> = (props: Props): JSX.Element => {
    const dispatch = useDispatch();
    const currentTeam = useSelector((state: GlobalState) => getCurrentTeam(state));
    const showJoinChannelTourTip = useShowOnboardingTutorialStep(OnboardingTourSteps.JOIN_CHANNELS);
    const showCreateTutorialTip = useShowOnboardingTutorialStep(OnboardingTourSteps.CREATE_CHANNELS);
    const showInviteTutorialTip = false;
    const isAddChannelOpen = useSelector(isAddChannelDropdownOpen);
    const openAddChannelOpen = useCallback((open: boolean) => {
        dispatch(setAddChannelDropdown(open));
    }, []);

    const [menuToggled, setMenuToggled] = useState(false);

    const handleMenuToggle = () => {
        setMenuToggled(!menuToggled);
    };

    return (
        <>
            <SidebarHeaderContainer
                id={'sidebar-header-container'}
            >
                <OverlayTrigger

                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={currentTeam.description?.length ? (
                        <Tooltip id='team-name__tooltip'>{currentTeam.description}</Tooltip>
                    ) : <></>}
                >
                    <MenuWrapper
                        onToggle={handleMenuToggle}
                        className='SidebarHeaderMenuWrapper test-team-header'
                    >
                        <SidebarHeading>
                            <button className='style--none sidebar-header'>
                                <span className='title'>{currentTeam.display_name}</span>
                                <i className='icon icon-chevron-down'/>
                            </button>
                        </SidebarHeading>
                        <MainMenu id='sidebarDropdownMenu'/>
                    </MenuWrapper>
                </OverlayTrigger>
                <AddChannelDropdown
                    showNewChannelModal={props.showNewChannelModal}
                    showMoreChannelsModal={props.showMoreChannelsModal}
                    invitePeopleModal={props.invitePeopleModal}
                    showCreateCategoryModal={props.showCreateCategoryModal}
                    canCreateChannel={props.canCreateChannel}
                    canJoinPublicChannel={props.canJoinPublicChannel}
                    handleOpenDirectMessagesModal={props.handleOpenDirectMessagesModal}
                    unreadFilterEnabled={props.unreadFilterEnabled}
                    showJoinChannelTutorialTip={showJoinChannelTourTip}
                    showCreateTutorialTip={showCreateTutorialTip}
                    showInviteTutorialTip={showInviteTutorialTip}
                    isAddChannelOpen={isAddChannelOpen}
                    openAddChannelOpen={openAddChannelOpen}
                    canCreateCustomGroups={props.canCreateCustomGroups}
                    showCreateUserGroupModal={props.showCreateUserGroupModal}
                    userGroupsEnabled={props.userGroupsEnabled}
                    showWorkTemplateButton={props.showWorkTemplateButton}
                />
            </SidebarHeaderContainer>
        </>
    );
};

export default SidebarHeader;
