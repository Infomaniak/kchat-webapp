import {fireEvent, screen} from '@testing-library/react';
import React from 'react';

import {TestHelper} from 'utils/test_helper';

import {renderWithContext} from 'tests/react_testing_utils';

import GroupItem from './group_item';

jest.mock('components/user_group_popover/user_group_popover_controller', () => ({
    UserGroupPopoverController: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

describe('GroupItem', () => {
    const group = TestHelper.getGroupMock({
        id: 'g1',
        display_name: 'Engineering',
        member_count: 9,
    });

    it('renders group display name', () => {
        renderWithContext(<GroupItem group={group}/>);

        expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('renders member count', () => {
        renderWithContext(<GroupItem group={group}/>);

        expect(screen.getByText('9 members')).toBeInTheDocument();
    });

    it('renders singular member count', () => {
        const singleMemberGroup = TestHelper.getGroupMock({
            id: 'g2',
            display_name: 'Solo',
            member_count: 1,
        });
        renderWithContext(<GroupItem group={singleMemberGroup}/>);

        expect(screen.getByText('1 member')).toBeInTheDocument();
    });

    it('does not show remove link when not editing', () => {
        renderWithContext(
            <GroupItem
                group={group}
                editing={false}
                canRemove={true}
            />,
        );

        expect(screen.queryByText('Remove from channel')).not.toBeInTheDocument();
    });

    it('does not show remove link when editing but canRemove is false', () => {
        renderWithContext(
            <GroupItem
                group={group}
                editing={true}
                canRemove={false}
            />,
        );

        expect(screen.queryByText('Remove from channel')).not.toBeInTheDocument();
    });

    it('shows remove link when editing and canRemove', () => {
        renderWithContext(
            <GroupItem
                group={group}
                editing={true}
                canRemove={true}
            />,
        );

        expect(screen.getByText('Remove from channel')).toBeInTheDocument();
    });

    it('dispatches openModal on remove click', () => {
        renderWithContext(
            <GroupItem
                group={group}
                editing={true}
                canRemove={true}
            />,
        );

        fireEvent.click(screen.getByText('Remove from channel'));
    });
});
