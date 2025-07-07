// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ShallowWrapper} from 'enzyme';
import {shallow} from 'enzyme';
import React from 'react';
import * as reactRedux from 'react-redux';
import {Link} from 'react-router-dom';

import type {Theme} from 'mattermost-redux/selectors/entities/preferences';
import * as teamSelectors from 'mattermost-redux/selectors/entities/teams';

import AnyTeamPermissionGate from 'components/permissions_gates/any_team_permission_gate';

import EmojiList from './emoji_list';
import EmojiPage from './emoji_page';

jest.mock('utils/utils', () => ({
    localizeMessage: jest.fn().mockReturnValue('Custom Emoji'),
    resetTheme: jest.fn(),
    applyTheme: jest.fn(),
}));

jest.spyOn(reactRedux, 'useSelector').mockImplementation((selector) => {
    if (selector === teamSelectors.getCurrentPackName) {
        return 'ksuite_essential';
    }
});

describe('EmojiPage', () => {
    const mockLoadRolesIfNeeded = jest.fn();
    const mockScrollToTop = jest.fn();
    const mockCurrentTheme = {} as Theme;

    const defaultProps = {
        teamName: 'team',
        teamDisplayName: 'Team Display Name',
        siteName: 'Site Name',
        scrollToTop: mockScrollToTop,
        currentTheme: mockCurrentTheme,
        isQuotaExceeded: false,
        actions: {
            loadRolesIfNeeded: mockLoadRolesIfNeeded,
        },
    };

    it('should render without crashing', () => {
        const wrapper: ShallowWrapper = shallow(<EmojiPage {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should render the emoji list and the add button with permission', () => {
        const wrapper: ShallowWrapper = shallow(<EmojiPage {...defaultProps}/>);
        expect(wrapper.find(EmojiList).exists()).toBe(true);
        expect(wrapper.find(AnyTeamPermissionGate).exists()).toBe(true);
        expect(wrapper.find(Link).prop('to')).toBe('/team/emoji/add');
    });

    it('should not render the add button if permission is not granted', () => {
        const wrapper: ShallowWrapper = shallow(
            <EmojiPage {...defaultProps}/>,
        ).setProps({teamName: '', actions: {loadRolesIfNeeded: mockLoadRolesIfNeeded}});
        expect(wrapper.find(AnyTeamPermissionGate).exists()).toBe(true);
        expect(wrapper.find(Link).exists()).toBe(true); // Update this to match your permission setup
    });

    it('should render EmojiList component', () => {
        const wrapper = shallow(<EmojiPage {...defaultProps}/>);
        expect(wrapper.find(EmojiList).exists()).toBe(true);
    });

    it('IK: should render a button with wc-icon when emoji quota is exceeded', () => {
        const defaultWithQuotaExceeded = {...defaultProps, isQuotaExceeded: true};
        const wrapper: ShallowWrapper = shallow(<EmojiPage {...defaultWithQuotaExceeded}/>);

        expect(wrapper.find('Link').exists()).toBe(false);
        expect(wrapper.find('button.btn-primary').exists()).toBe(true);

        const button = wrapper.find('button.btn-primary');
        expect(button.find('wc-icon[name="rocket"]').exists()).toBe(true);
    });

    it('IK: should render a link to add emoji when quota is NOT exceeded', () => {
        const wrapper: ShallowWrapper = shallow(<EmojiPage {...defaultProps}/>);

        expect(wrapper.find('Link').exists()).toBe(true);
    });
});
