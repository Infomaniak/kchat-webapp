import React from 'react';

import {TestHelper} from 'utils/test_helper';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import ChannelHeaderPublicMenu from './channel_header_public_private_menu';

jest.mock('mattermost-redux/selectors/entities/roles', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/roles'),
    haveIChannelPermission: () => true,
}));

jest.mock('mattermost-redux/selectors/entities/channels', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/channels'),
    getRedirectChannelNameForCurrentTeam: () => 'town-square',
}));

jest.mock('selectors/local_storage', () => ({
    getPenultimateViewedChannelName: () => 'town-square',
}));

describe('components/ChannelHeaderMenu/MenuItems/LeaveChannelTest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // IK: We removed the Mattermost archive channel button for non-archived and non-default channels
    // as we handle archiving through IkLeaveChannelModal instead

    test('should not render archive channel menu item', () => {
        const channel = TestHelper.getChannelMock({
            delete_at: 0,
            type: 'O',
        });
        const user = TestHelper.getUserMock();

        renderWithContext(
            <ChannelHeaderPublicMenu
                channel={channel}
                user={user}
                isMuted={false}
                isReadonly={false}
                isDefault={false}
                isMobile={false}
                isFavorite={false}
                isLicensedForLDAPGroups={false}
                pluginItems={[]}
            />,
        );

        const archiveMenuItem = screen.queryByText('Archive Channel');
        expect(archiveMenuItem).not.toBeInTheDocument();
    });
});
