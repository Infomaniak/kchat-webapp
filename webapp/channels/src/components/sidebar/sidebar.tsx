// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import {trackEvent} from 'actions/telemetry_actions';

import CreateUserGroupsModal from 'components/create_user_groups_modal';
import DataPrefetch from 'components/data_prefetch';
import EditCategoryModal from 'components/edit_category_modal';
import InvitationModal from 'components/invitation_modal';
import MoreChannels from 'components/more_channels';
import MoreDirectChannels from 'components/more_direct_channels';
import NewChannelModal from 'components/new_channel_modal/new_channel_modal';

import Pluggable from 'plugins/pluggable';
import Constants, {ModalIdentifiers, RHSStates} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';
import * as Utils from 'utils/utils';

import type {ModalData} from 'types/actions';
import type {RhsState} from 'types/store/rhs';

import ChannelNavigator from './channel_navigator';
import MobileSidebarHeader from './mobile_sidebar_header';
import SidebarHeader from './sidebar_header';
import SidebarList from './sidebar_list';

import KeyboardShortcutsModal from '../keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';

type Props = {
    teamId: string;
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
    canJoinPublicChannel: boolean;
    isOpen: boolean;
    hasSeenModal: boolean;
    isRhsSettings?: boolean;
    actions: {
        fetchMyCategories: (teamId: string) => {data: boolean};
        createCategory: (teamId: string, categoryName: string) => {data: string};
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: (modalId: string) => void;
        clearChannelSelection: () => void;
        showSettings: () => void;
        closeRightHandSide: () => void;
    };
    isCloud: boolean;
    unreadFilterEnabled: boolean;
    isMobileView: boolean;
    isKeyBoardShortcutModalOpen: boolean;
    userGroupsEnabled: boolean;
    canCreateCustomGroups: boolean;
    rhsState?: RhsState;
    rhsOpen?: boolean;
    showWorkTemplateButton: boolean;
    isMoreDmsModalOpen: boolean;
};

type State = {
    isDragging: boolean;
};

export default class Sidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isDragging: false,
        };
    }

    componentDidMount() {
        if (this.props.teamId) {
            this.props.actions.fetchMyCategories(this.props.teamId);
        }

        window.addEventListener('click', this.handleClickClearChannelSelection);
        window.addEventListener('keydown', this.handleKeyDownEvent);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.teamId && prevProps.teamId !== this.props.teamId) {
            this.props.actions.fetchMyCategories(this.props.teamId);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleClickClearChannelSelection);
        window.removeEventListener('keydown', this.handleKeyDownEvent);
    }

    handleClickClearChannelSelection = (event: MouseEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        this.props.actions.clearChannelSelection();
    };

    handleKeyDownEvent = (event: KeyboardEvent) => {
        if (Utils.isKeyPressed(event, Constants.KeyCodes.ESCAPE)) {
            this.props.actions.clearChannelSelection();
            return;
        }

        const ctrlOrMetaKeyPressed = Utils.cmdOrCtrlPressed(event, true);

        if (ctrlOrMetaKeyPressed) {
            if (Utils.isKeyPressed(event, Constants.KeyCodes.FORWARD_SLASH)) {
                event.preventDefault();
                if (this.props.isKeyBoardShortcutModalOpen) {
                    this.props.actions.closeModal(ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL);
                } else {
                    this.props.actions.openModal({
                        modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL,
                        dialogType: KeyboardShortcutsModal,
                    });
                }
            } else if (Utils.isKeyPressed(event, Constants.KeyCodes.A) && event.shiftKey) {
                event.preventDefault();

                if (this.props.isRhsSettings) {
                    this.props.actions.closeRightHandSide();
                } else {
                    this.props.actions.showSettings();
                }
            }
        }
    };

    toggleMoreDirectChannelsModal = () => {
        if (this.props.isMoreDmsModalOpen) {
            this.props.actions.closeModal(ModalIdentifiers.CREATE_DM_CHANNEL);
            return;
        }
        this.closeEditRHS();
        this.props.actions.openModal({
            modalId: ModalIdentifiers.CREATE_DM_CHANNEL,
            dialogType: MoreDirectChannels,
            dialogProps: {isExistingChannel: false},
        });
    };

    showCreateCategoryModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
        });
        trackEvent('ui', 'ui_sidebar_menu_createCategory');
    };

    handleCreateCategory = (categoryName: string) => {
        this.props.actions.createCategory(this.props.teamId, categoryName);
    };

    showMoreChannelsModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.MORE_CHANNELS,
            dialogType: MoreChannels,
            dialogProps: {morePublicChannelsModalType: 'public'},
        });
        trackEvent('ui', 'ui_channels_more_public_v2');
    };

    invitePeopleModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.INVITATION,
            dialogType: InvitationModal,
        });
        trackEvent('ui', 'ui_channels_dropdown_invite_people');
    };

    showNewChannelModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NEW_CHANNEL_MODAL,
            dialogType: NewChannelModal,
        });
        this.closeEditRHS();
        trackEvent('ui', 'ui_channels_create_channel_v2');
    };

    showCreateUserGroupModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
        });
        trackEvent('ui', 'ui_channels_create_user_group');
    };

    handleOpenMoreDirectChannelsModal = (e: Event) => {
        e.preventDefault();
        this.toggleMoreDirectChannelsModal();
    };

    onDragStart = () => {
        this.setState({isDragging: true});
    };

    onDragEnd = () => {
        this.setState({isDragging: false});
    };

    closeEditRHS = () => {
        if (this.props.rhsOpen && this.props.rhsState === RHSStates.EDIT_HISTORY) {
            this.props.actions.closeRightHandSide();
        }
    };

    render() {
        const root: Element | null = document.querySelector('#root');

        if (!this.props.teamId) {
            return (<div/>);
        }

        if (isDesktopApp()) {
            root!.classList.add('no-webcomponents');
        }

        const ariaLabel = Utils.localizeMessage('accessibility.sections.lhsNavigator', 'channel navigator region');

        return (
            <div
                id='SidebarContainer'
                className={classNames({
                    'move--right': this.props.isOpen && this.props.isMobileView,
                    dragging: this.state.isDragging,
                })}
            >
                {this.props.isMobileView ? <MobileSidebarHeader/> : (
                    <SidebarHeader
                        showNewChannelModal={this.showNewChannelModal}
                        showMoreChannelsModal={this.showMoreChannelsModal}
                        showCreateUserGroupModal={this.showCreateUserGroupModal}
                        invitePeopleModal={this.invitePeopleModal}
                        showCreateCategoryModal={this.showCreateCategoryModal}
                        canCreateChannel={this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel}
                        canJoinPublicChannel={this.props.canJoinPublicChannel}
                        handleOpenDirectMessagesModal={this.handleOpenMoreDirectChannelsModal}
                        unreadFilterEnabled={this.props.unreadFilterEnabled}
                        userGroupsEnabled={this.props.userGroupsEnabled}
                        canCreateCustomGroups={this.props.canCreateCustomGroups}
                        showWorkTemplateButton={this.props.showWorkTemplateButton}
                    />
                )}
                <div
                    id='lhsNavigator'
                    role='application'
                    aria-label={ariaLabel}
                    className='a11y__region'
                    data-a11y-sort-order='6'
                >
                    <ChannelNavigator
                        showNewChannelModal={this.showNewChannelModal}
                        showMoreChannelsModal={this.showMoreChannelsModal}
                        showCreateUserGroupModal={this.showCreateUserGroupModal}
                        invitePeopleModal={this.invitePeopleModal}
                        showCreateCategoryModal={this.showCreateCategoryModal}
                        canCreateChannel={this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel}
                        canJoinPublicChannel={this.props.canJoinPublicChannel}
                        handleOpenDirectMessagesModal={this.handleOpenMoreDirectChannelsModal}
                        unreadFilterEnabled={this.props.unreadFilterEnabled}
                        userGroupsEnabled={this.props.userGroupsEnabled}
                    />
                </div>
                <div className='sidebar--left__icons'>
                    <Pluggable pluggableName='LeftSidebarHeader'/>
                </div>
                <SidebarList
                    handleOpenMoreDirectChannelsModal={this.handleOpenMoreDirectChannelsModal}
                    onDragStart={this.onDragStart}
                    onDragEnd={this.onDragEnd}
                />
                <DataPrefetch/>
            </div>
        );
    }
}
