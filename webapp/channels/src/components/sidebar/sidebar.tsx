// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {lazy} from 'react';

import {trackEvent} from 'actions/telemetry_actions';

import {makeAsyncComponent} from 'components/async_load';
import DataPrefetch from 'components/data_prefetch';
import ResizableLhs from 'components/resizable_sidebar/resizable_lhs';
import SidebarHeader from 'components/sidebar/sidebar_header';
import SwitchServer from 'components/switch_server';

import Constants, {ModalIdentifiers, RHSStates} from 'utils/constants';
import {isKeyPressed, cmdOrCtrlPressed} from 'utils/keyboard';
import {isDesktopApp} from 'utils/user_agent';
import {localizeMessage} from 'utils/utils';

import Pluggable from 'plugins/pluggable';

import type {ModalData} from 'types/actions';
import type {RhsState} from 'types/store/rhs';

import ChannelNavigator from './channel_navigator';
import SidebarList from './sidebar_list';

const MobileSidebarHeader = makeAsyncComponent('MobileSidebarHeader', lazy(() => import('./mobile_sidebar_header')));
const MoreDirectChannels = makeAsyncComponent('MoreDirectChannels', lazy(() => import('components/more_direct_channels')));
const BrowseChannels = makeAsyncComponent('BrowseChannels', lazy(() => import('components/browse_channels')));
const EditCategoryModal = makeAsyncComponent('EditCategoryModal', lazy(() => import('components/edit_category_modal')));
const CreateUserGroupsModal = makeAsyncComponent('CreateUserGroupsModal', lazy(() => import('components/create_user_groups_modal')));
const InvitationModal = makeAsyncComponent('InvitationModal', lazy(() => import('components/invitation_modal')));
const KeyboardShortcutsModal = makeAsyncComponent('KeyboardShortcutsModal', lazy(() => import('components/keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal')));
const NewChannelModal = makeAsyncComponent('NewChannelModal', lazy(() => import('components/new_channel_modal/new_channel_modal')));

type Props = {
    teamId: string;
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
    canJoinPublicChannel: boolean;
    isOpen: boolean;
    actions: {
        fetchMyCategories: (teamId: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: (modalId: string) => void;
        clearChannelSelection: () => void;
        closeRightHandSide: () => void;

        // IK: custom settings
        showSettings: () => void;
    };
    unreadFilterEnabled: boolean;
    isMobileView: boolean;
    isKeyBoardShortcutModalOpen: boolean;
    canCreateCustomGroups: boolean;
    rhsState?: RhsState;
    rhsOpen?: boolean;

    // IK: For resizing left controls when lhs is resized since our layout has a split global header
    headerRef: React.RefObject<HTMLDivElement>;

    // IK: Custom settings
    isRhsSettings?: boolean;

};

type State = {
    showDirectChannelsModal: boolean;
    isDragging: boolean;
};

export default class Sidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showDirectChannelsModal: false,
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
        if (isKeyPressed(event, Constants.KeyCodes.ESCAPE)) {
            this.props.actions.clearChannelSelection();
            return;
        }

        const ctrlOrMetaKeyPressed = cmdOrCtrlPressed(event, true);

        if (ctrlOrMetaKeyPressed) {
            if (isKeyPressed(event, Constants.KeyCodes.FORWARD_SLASH)) {
                event.preventDefault();
                if (this.props.isKeyBoardShortcutModalOpen) {
                    this.props.actions.closeModal(ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL);
                } else {
                    this.props.actions.openModal({
                        modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL,
                        dialogType: KeyboardShortcutsModal,
                    });
                }
            } else if (isKeyPressed(event, Constants.KeyCodes.A) && event.shiftKey) {
                event.preventDefault();

                if (this.props.isRhsSettings) {
                    this.props.actions.closeRightHandSide();
                } else {
                    this.props.actions.showSettings();
                }
            }
        }
    };

    showMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: true});
        trackEvent('ui', 'ui_channels_more_direct_v2');
    };

    hideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false});
    };

    showCreateCategoryModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {},
        });
        trackEvent('ui', 'ui_sidebar_menu_createCategory');
    };

    showMoreChannelsModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.MORE_CHANNELS,
            dialogType: BrowseChannels,
        });
        trackEvent('ui', 'ui_channels_more_public_v2');
    };

    invitePeopleModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.INVITATION,
            dialogType: InvitationModal,
            dialogProps: {focusOriginElement: 'browseOrAddChannelMenuButton'},
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

    handleOpenMoreDirectChannelsModal = (e?: Event) => {
        e?.preventDefault();
        if (this.state.showDirectChannelsModal) {
            this.hideMoreDirectChannelsModal();
        } else {
            this.showMoreDirectChannelsModal();
            this.closeEditRHS();
        }
    };

    onDragStart = () => {
        this.setState({isDragging: true});
    };

    onDragEnd = () => {
        this.setState({isDragging: false});
    };

    renderModals = () => {
        let moreDirectChannelsModal;
        if (this.state.showDirectChannelsModal) {
            moreDirectChannelsModal = (
                <MoreDirectChannels
                    onModalDismissed={this.hideMoreDirectChannelsModal}
                    isExistingChannel={false}
                    focusOriginElement='newDirectMessageButton'
                />
            );
        }

        return (
            <>
                {moreDirectChannelsModal}
            </>
        );
    };

    closeEditRHS = () => {
        if (this.props.rhsOpen && this.props.rhsState === RHSStates.EDIT_HISTORY) {
            this.props.actions.closeRightHandSide();
        }
    };

    render() {
        if (!this.props.teamId) {
            return (<div/>);
        }

        const ariaLabel = localizeMessage({id: 'accessibility.sections.lhsNavigator', defaultMessage: 'channel navigator region'});

        return (
            <ResizableLhs
                id='SidebarContainer'
                className={classNames({
                    'move--right': this.props.isOpen && this.props.isMobileView,
                    dragging: this.state.isDragging,
                })}
                headerRef={this.props.headerRef}
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
                        canCreateCustomGroups={this.props.canCreateCustomGroups}
                    />
                )}
                {/* {!isDesktopApp() && <SwitchServer/>} */}
                <div
                    id='lhsNavigator'
                    role='application'
                    aria-label={ariaLabel}
                    className='a11y__region'
                    data-a11y-sort-order='6'
                >
                    <ChannelNavigator/>
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
                {this.renderModals()}
            </ResizableLhs>
        );
    }
}
