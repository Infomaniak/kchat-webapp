import {fireEvent, screen} from '@testing-library/react';
import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';

import IkRemoveGroupFromChannelModal from './ik_remove_group_from_channel_modal';

beforeEach(() => {
    window.open = jest.fn();
});

describe('IkRemoveGroupFromChannelModal', () => {
    const initialState = {
        entities: {
            teams: {currentTeamId: 'team1', teams: {team1: {id: 'team1', account_id: 123}}, myMembers: {}},
            general: {config: {}, license: {}},
            users: {currentUserId: 'user1', profiles: {}},
            preferences: {myPreferences: {}},
            roles: {roles: {}},
        },
    };

    it('renders the title and body', () => {
        renderWithContext(
            <IkRemoveGroupFromChannelModal onExited={jest.fn()}/>,
            initialState,
        );

        expect(screen.getByText('Remove the team from the channel')).toBeInTheDocument();
        expect(screen.getByText(/Team access management is centralized in the Manager/)).toBeInTheDocument();
    });

    it('shows Cancel and Manage buttons', () => {
        renderWithContext(
            <IkRemoveGroupFromChannelModal onExited={jest.fn()}/>,
            initialState,
        );

        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Manage')).toBeInTheDocument();
    });

    it('calls onExited when Manage is clicked', () => {
        const onExited = jest.fn();
        renderWithContext(
            <IkRemoveGroupFromChannelModal onExited={onExited}/>,
            initialState,
        );

        fireEvent.click(screen.getByText('Manage'));
        expect(onExited).toHaveBeenCalled();
    });

    it('shows Cancel button that does not throw', () => {
        renderWithContext(
            <IkRemoveGroupFromChannelModal onExited={jest.fn()}/>,
            initialState,
        );

        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton.tagName).toBe('BUTTON');
        expect(() => fireEvent.click(cancelButton)).not.toThrow();
    });
});
