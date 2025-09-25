// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import * as utilsNotifications from 'utils/notifications';
import {isMobileBrowser} from 'utils/user_agent';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import NotificationPermissionBar from './index';

jest.mock('utils/user_agent', () => ({
    ...jest.requireActual('utils/user_agent'),
    isMobileBrowser: jest.fn(),
}));

describe('NotificationPermissionBar', () => {
    const initialState = {
        entities: {
            users: {
                currentUserId: 'user-id',
            },
            general: {
                config: {},
                license: {},
            },
        },
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should render the NotificationUnsupportedBar if notifications are not supported and NOT on mobile', () => {
        jest.spyOn(utilsNotifications, 'isNotificationAPISupported').mockReturnValue(false);
        (isMobileBrowser as jest.Mock).mockReturnValue(false);

        const {container} = renderWithContext(<NotificationPermissionBar/>, initialState);

        expect(container).toMatchSnapshot();

        expect(screen.queryByText('Your browser does not support browser notifications.')).toBeInTheDocument();
        expect(screen.queryByText('Update your browser')).toBeInTheDocument();
    });

    test('should NOT render the NotificationUnsupportedBar if notifications are not supported on mobile', () => {
        jest.spyOn(utilsNotifications, 'isNotificationAPISupported').mockReturnValue(false);
        (isMobileBrowser as jest.Mock).mockReturnValue(true);

        const {container} = renderWithContext(<NotificationPermissionBar/>, initialState);

        expect(container).toMatchSnapshot();

        expect(screen.queryByText('Your browser does not support browser notifications.')).not.toBeInTheDocument();
        expect(screen.queryByText('Update your browser')).not.toBeInTheDocument();
    });
});
