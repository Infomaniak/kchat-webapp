import {render, screen} from '@testing-library/react';
import React from 'react';
import {IntlProvider} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {Group} from '@mattermost/types/groups';

import {TestHelper} from 'utils/test_helper';

import IkMemberInGroupModal from './ik_member_in_group_modal';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: () => 'account123',
}));

describe('IkMemberInGroupModal', () => {
    const channel = TestHelper.getChannelMock({
        id: 'ch1',
        display_name: 'Test Channel',
    }) as Channel;

    const groups: Group[] = [
        TestHelper.getGroupMock({id: 'g1', display_name: 'Engineering', member_count: 9}),
        TestHelper.getGroupMock({id: 'g2', display_name: 'Design', member_count: 4}),
    ];

    const renderWithIntl = (ui: React.ReactElement) =>
        render(
            <IntlProvider
                locale='en'
                messages={{}}
            >
                {ui}
            </IntlProvider>);

    it('renders the title with channel name', () => {
        renderWithIntl(
            <IkMemberInGroupModal
                channel={channel}
                groups={groups}
                isSystemAdmin={false}
                onExited={jest.fn()}
            />,
        );

        expect(screen.getByText(/Remove access to channel Test Channel/)).toBeInTheDocument();
    });

    it('renders the body text', () => {
        renderWithIntl(
            <IkMemberInGroupModal
                channel={channel}
                groups={groups}
                isSystemAdmin={false}
                onExited={jest.fn()}
            />,
        );

        expect(screen.getByText(/This member is part of teams/)).toBeInTheDocument();
    });

    it('renders all groups with display name and member count', () => {
        renderWithIntl(
            <IkMemberInGroupModal
                channel={channel}
                groups={groups}
                isSystemAdmin={false}
                onExited={jest.fn()}
            />,
        );

        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Design')).toBeInTheDocument();
        expect(screen.getByText('9 members')).toBeInTheDocument();
        expect(screen.getByText('4 members')).toBeInTheDocument();
    });

    it('shows Manage link for system admin', () => {
        renderWithIntl(
            <IkMemberInGroupModal
                channel={channel}
                groups={groups}
                isSystemAdmin={true}
                onExited={jest.fn()}
            />,
        );

        expect(screen.getAllByText('Manage')).toHaveLength(groups.length);
    });

    it('does not show Manage link for non-admin', () => {
        renderWithIntl(
            <IkMemberInGroupModal
                channel={channel}
                groups={groups}
                isSystemAdmin={false}
                onExited={jest.fn()}
            />,
        );

        expect(screen.queryByText('Manage')).not.toBeInTheDocument();
    });

    it('shows Cancel button', () => {
        renderWithIntl(
            <IkMemberInGroupModal
                channel={channel}
                groups={groups}
                isSystemAdmin={false}
                onExited={jest.fn()}
            />,
        );

        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
});
