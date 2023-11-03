// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import MoreDirectChannels from 'components/more_direct_channels';
import Sidebar from 'components/sidebar/sidebar';

import Constants, {ModalIdentifiers} from '../../utils/constants';

describe('components/sidebar', () => {
    const baseProps = {
        canCreatePublicChannel: true,
        canCreatePrivateChannel: true,
        canJoinPublicChannel: true,
        isOpen: false,
        teamId: 'fake_team_id',
        hasSeenModal: true,
        isCloud: false,
        unreadFilterEnabled: false,
        isMobileView: false,
        isKeyBoardShortcutModalOpen: false,
        userGroupsEnabled: false,
        canCreateCustomGroups: true,
        showWorkTemplateButton: true,
        isMoreDmsModalOpen: false,
        actions: {
            createCategory: jest.fn(),
            fetchMyCategories: jest.fn(),
            openModal: jest.fn(),
            closeModal: jest.fn(),
            clearChannelSelection: jest.fn(),
            closeRightHandSide: jest.fn(),
            showSettings: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Sidebar {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('Should call Shortcut modal on FORWARD_SLASH+ctrl/meta', () => {
        const wrapper = shallow<Sidebar>(
            <Sidebar {...baseProps}/>,
        );
        const instance = wrapper.instance();

        let key = Constants.KeyCodes.BACK_SLASH[0] as string;
        let keyCode = Constants.KeyCodes.BACK_SLASH[1] as number;
        instance.handleKeyDownEvent({ctrlKey: true, preventDefault: jest.fn(), key, keyCode} as any);
        expect(wrapper.instance().props.actions.openModal).not.toHaveBeenCalled();

        key = 'ù';
        keyCode = Constants.KeyCodes.FORWARD_SLASH[1] as number;
        instance.handleKeyDownEvent({ctrlKey: true, preventDefault: jest.fn(), key, keyCode} as any);
        expect(wrapper.instance().props.actions.openModal).toHaveBeenCalledWith(expect.objectContaining({modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL}));

        key = '/';
        keyCode = Constants.KeyCodes.SEVEN[1] as number;
        instance.handleKeyDownEvent({ctrlKey: true, preventDefault: jest.fn(), key, keyCode} as any);
        expect(wrapper.instance().props.actions.openModal).toHaveBeenCalledWith(expect.objectContaining({modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL}));

        key = Constants.KeyCodes.FORWARD_SLASH[0] as string;
        keyCode = Constants.KeyCodes.FORWARD_SLASH[1] as number;
        instance.handleKeyDownEvent({ctrlKey: true, preventDefault: jest.fn(), key, keyCode} as any);
        expect(wrapper.instance().props.actions.openModal).toHaveBeenCalledWith(expect.objectContaining({modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL}));
    });

    describe('should toggle direct messages modal correctly', () => {
        test('should open direct messages modal', () => {
            const openModal = jest.fn();
            const props = {
                ...baseProps,
                actions: {
                    ...baseProps.actions,
                    openModal,
                },
            };
            const wrapper = shallow<Sidebar>(
                <Sidebar {...props}/>,
            );
            const instance = wrapper.instance();
            instance.closeEditRHS = jest.fn();
            const mockEvent: Partial<Event> = {preventDefault: jest.fn()};

            instance.handleOpenMoreDirectChannelsModal(mockEvent as any);
            expect(openModal).toHaveBeenCalledTimes(1);
            expect(instance.closeEditRHS).toHaveBeenCalledTimes(1);
            expect(openModal).toHaveBeenCalledWith({
                modalId: ModalIdentifiers.CREATE_DM_CHANNEL,
                dialogType: MoreDirectChannels,
                dialogProps: {isExistingChannel: false},
            });
        });
        test('should close direct messages modal', () => {
            const closeModal = jest.fn();
            const props = {
                ...baseProps,
                isMoreDmsModalOpen: true,
                actions: {
                    ...baseProps.actions,
                    closeModal,
                },
            };
            const wrapper = shallow<Sidebar>(
                <Sidebar {...props}/>,
            );
            const instance = wrapper.instance();
            const mockEvent: Partial<Event> = {preventDefault: jest.fn()};

            instance.handleOpenMoreDirectChannelsModal(mockEvent as any);
            expect(closeModal).toHaveBeenCalledTimes(1);
            expect(closeModal).toHaveBeenCalledWith(ModalIdentifiers.CREATE_DM_CHANNEL);
        });
    });

    test('should match empty div snapshot when teamId is missing', () => {
        const props = {
            ...baseProps,
            teamId: '',
        };
        const wrapper = shallow(
            <Sidebar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
