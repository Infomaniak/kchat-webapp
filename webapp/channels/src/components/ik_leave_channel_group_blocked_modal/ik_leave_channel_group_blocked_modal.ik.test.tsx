import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {IntlProvider} from 'react-intl';

import type {Group} from '@mattermost/types/groups';

import IkLeaveChannelGroupBlockedModal from './ik_leave_channel_group_blocked_modal';

describe('IkLeaveChannelGroupBlockedModal', () => {
    const intlProviderProps = {
        locale: 'en',
        messages: {},
    };

    const mockGroups: Group[] = [
        {
            id: 'group1',
            name: 'team-alpha',
            display_name: 'Team Alpha',
            description: '',
            source: '',
            remote_id: '',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            has_syncables: false,
            member_count: 42,
            allow_reference: true,
        },
    ];

    const renderWithIntl = (ui: React.ReactElement) =>
        render(<IntlProvider {...intlProviderProps}>{ui}</IntlProvider>);

    it('renders the title and body', () => {
        renderWithIntl(
            <IkLeaveChannelGroupBlockedModal
                groups={mockGroups}
                onExited={jest.fn()}
            />);

        expect(screen.getByText('Leave Channel')).toBeInTheDocument();
        expect(screen.getByText(/This channel is linked to the following teams/)).toBeInTheDocument();
    });

    it('shows a Cancel button and no Confirm button', () => {
        renderWithIntl(
            <IkLeaveChannelGroupBlockedModal
                groups={mockGroups}
                onExited={jest.fn()}
            />);

        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
    });

    it('calls cancel handler when Cancel is clicked', () => {
        renderWithIntl(
            <IkLeaveChannelGroupBlockedModal
                groups={mockGroups}
                onExited={jest.fn()}
            />);

        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton.tagName).toBe('BUTTON');

        expect(() => fireEvent.click(cancelButton)).not.toThrow();
    });

    it('displays the list of groups', () => {
        renderWithIntl(
            <IkLeaveChannelGroupBlockedModal
                groups={mockGroups}
                onExited={jest.fn()}
            />);

        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
        expect(screen.getByText('42 members')).toBeInTheDocument();
    });
});
