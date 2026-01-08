// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {screen} from '@testing-library/react';
import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';

import TeamButton from './team_button';

jest.mock('utils/user_agent', () => ({
    isDesktopApp: jest.fn().mockReturnValue(true),
    getDesktopVersion: jest.fn(() => '2.0.0'),
}));

jest.mock('utils/server_version', () => ({
    isServerVersionGreaterThanOrEqualTo: jest.fn().mockReturnValue(true),
}));

describe('components/TeamSidebar/TeamButton', () => {
    const baseProps = {
        btnClass: '',
        url: '',
        displayName: '',
        tip: '',
        order: 0,
        showOrder: false,
        active: false,
        disabled: false,
        unread: false,
        mentions: 0,
        teamIconUrl: null,
        switchTeam: () => {},
        isDraggable: false,
        teamIndex: 0,
        teamId: '',
        isInProduct: false,
    };

    it('should show unread badge and set class when unread in channels', () => {
        const props = {
            ...baseProps,
            active: false,
            unread: true,
        };

        renderWithContext(
            <TeamButton {...props}/>,
        );

        expect(screen.queryByTestId('team-badge-')).toBeInTheDocument();
        expect(screen.getByTestId('team-container-')).toHaveClass('unread');
    });

    it('should hide unread badge and set no class when unread in a product', () => {
        const props = {
            ...baseProps,
            active: false,
            unread: true,
            isInProduct: true,
        };

        renderWithContext(
            <TeamButton {...props}/>,
        );

        expect(screen.queryByTestId('team-badge-')).not.toBeInTheDocument();
        expect(screen.getByTestId('team-container-')).not.toHaveClass('unread');
    });

    it('should show mentions badge and set class when mentions in channels', () => {
        const props = {
            ...baseProps,
            active: false,
            unread: true,
            mentions: 1,
        };

        renderWithContext(
            <TeamButton {...props}/>,
        );

        expect(screen.queryByTestId('team-badge-')).toHaveClass('badge-max-number');
        expect(screen.getByTestId('team-container-')).toHaveClass('unread');
    });

    it('should hide mentions badge and set no class when mentions in product', () => {
        const props = {
            ...baseProps,
            active: false,
            unread: true,
            mentions: 1,
            isInProduct: true,
        };

        renderWithContext(
            <TeamButton {...props}/>,
        );

        expect(screen.queryByTestId('team-badge-')).not.toBeInTheDocument();
        expect(screen.getByTestId('team-container-')).not.toHaveClass('unread');
    });
});
