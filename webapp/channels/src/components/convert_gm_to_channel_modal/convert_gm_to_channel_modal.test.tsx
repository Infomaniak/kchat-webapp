// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';

import type {Channel} from '@mattermost/types/channels';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';
import type {DeepPartial} from '@mattermost/types/utilities';

import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';

import ConvertGmToChannelModal from 'components/convert_gm_to_channel_modal/convert_gm_to_channel_modal';

import TestHelper from 'packages/mattermost-redux/test/test_helper';
import {renderWithFullContext, screen} from 'tests/react_testing_utils';

import type {GlobalState} from 'types/store';

describe('component/ConvertGmToChannelModal', () => {
    const user1 = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const baseProps = {
        onExited: jest.fn(),
        channel: {id: 'channel_id_1', type: 'G'} as Channel,
        actions: {
            closeModal: jest.fn(),
            convertGroupMessageToPrivateChannel: jest.fn(),
            moveChannelsInSidebar: jest.fn(),
        },
        profilesInChannel: [user1, user2, user3] as UserProfile[],
        teammateNameDisplaySetting: Preferences.DISPLAY_PREFER_FULL_NAME,
        channelsCategoryId: 'sidebar_category_1',
        currentUserId: user1.id,
    };

    const team = {id: 'team_id_1', display_name: 'Team 1', name: 'team_1'} as Team;

    const baseState: DeepPartial<GlobalState> = {
        entities: {
            teams: {
                teams: {
                    team_id_1: {id: 'team_id_1', display_name: 'Team 1', name: 'team_1'} as Team,
                    team_id_2: {id: 'team_id_2', display_name: 'Team 2', name: 'team_2'} as Team,
                },
                currentTeamId: 'team_id_1',
            },
        },
    };

    test('duplicate channel names should npt be allowed', async () => {
        TestHelper.initBasic(Client4);

        baseProps.actions.convertGroupMessageToPrivateChannel.mockResolvedValueOnce({
            error: {
                server_error_id: 'store.sql_channel.save_channel.exists.app_error',
            },
        });

        renderWithFullContext(
            <ConvertGmToChannelModal
                currentTeam={team}
                {...baseProps}
            />,
            baseState,
        );

        await waitFor(
            () => expect(screen.queryByText('Conversation history will be visible to any channel members')).toBeInTheDocument(),
            {timeout: 1500},
        );

        const channelNameInput = screen.queryByPlaceholderText('Channel name');
        expect(channelNameInput).toBeInTheDocument();
        fireEvent.change(channelNameInput!, {target: {value: 'Channel'}});

        const confirmButton = screen.queryByText('Convert to private channel');
        expect(channelNameInput).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(confirmButton!);
        });

        expect(screen.queryByText('A channel with that URL already exists')).toBeInTheDocument();
    });
});
