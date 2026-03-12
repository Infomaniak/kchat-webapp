import React from 'react';

import Constants from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import SidebarBaseChannel from './sidebar_base_channel';
import type {Props} from './sidebar_base_channel';

jest.mock('components/sidebar/sidebar_channel/sidebar_channel_link', () => {
    return (props: any) => (
        <div data-testid='sidebar-channel-link'>
            <span>{props.label}</span>
            {props.channelLeaveHandler && (
                <button
                    data-testid='leave-button'
                    onClick={() => props.channelLeaveHandler(() => {})}
                />
            )}
        </div>
    );
});

jest.mock('./sidebar_base_channel_icon', () => {
    return () => <span data-testid='channel-icon'/>;
});

jest.mock('actions/views/channel', () => ({
    requestLeaveChannel: jest.fn(() => async () => ({data: undefined})),
}));

describe('SidebarBaseChannel group blocking', () => {
    const publicChannel = TestHelper.getChannelMock({
        id: 'ch1',
        type: Constants.OPEN_CHANNEL as 'O',
        name: 'test-channel',
        display_name: 'Test Channel',
    });

    const baseProps: Props = {
        channel: publicChannel,
        currentTeamName: 'team1',
        actions: {
            requestLeaveChannel: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render channel link', () => {
        renderWithContext(<SidebarBaseChannel {...baseProps}/>);

        expect(screen.getByText('Test Channel')).toBeInTheDocument();
    });

    it('should have leave button for public channel', () => {
        renderWithContext(<SidebarBaseChannel {...baseProps}/>);

        expect(screen.getByTestId('leave-button')).toBeInTheDocument();
    });

    it('should call requestLeaveChannel when leave button clicked', () => {
        renderWithContext(<SidebarBaseChannel {...baseProps}/>);

        screen.getByTestId('leave-button').click();

        expect(baseProps.actions.requestLeaveChannel).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.requestLeaveChannel).toHaveBeenCalledWith(publicChannel);
    });
});
