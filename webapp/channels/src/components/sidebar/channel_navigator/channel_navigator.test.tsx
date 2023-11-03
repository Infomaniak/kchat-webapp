// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {Props} from './channel_navigator';
import ChannelNavigator from './channel_navigator';

import AddChannelDropdown from '../add_channel_dropdown';

let props: Props;

describe('Components/ChannelNavigator', () => {
    beforeEach(() => {
        props = {
            canGoForward: true,
            canGoBack: true,
            canJoinPublicChannel: true,
            showMoreChannelsModal: jest.fn(),
            showCreateUserGroupModal: jest.fn(),
            invitePeopleModal: jest.fn(),
            showNewChannelModal: jest.fn(),
            showCreateCategoryModal: jest.fn(),
            handleOpenDirectMessagesModal: jest.fn(),
            unreadFilterEnabled: true,
            canCreateChannel: true,
            showUnreadsCategory: true,
            isQuickSwitcherOpen: false,
            userGroupsEnabled: false,
            canCreateCustomGroups: true,
            actions: {
                openModal: jest.fn(),
                closeModal: jest.fn(),
                goBack: jest.fn(),
                goForward: jest.fn(),
            },
        };
    });

    it('should not show AddChannelDropdown', () => {
        const wrapper = shallow(<ChannelNavigator {...props}/>);
        expect(wrapper.find(AddChannelDropdown).length).toBe(0);
    });
});
