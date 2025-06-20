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

// IK: After a regression, we make sure the archive channel option is there
describe('components/ChannelHeaderMenu/MenuItems/LeaveChannelTest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render archive channel menu item from a private channel', () => {
        const channel = TestHelper.getChannelMock({
            delete_at: 0,
            type: 'P',
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
        expect(archiveMenuItem).toBeInTheDocument();
    });

    test('should render archive channel menu item from a public channel', () => {
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
        expect(archiveMenuItem).toBeInTheDocument();
    });
});
