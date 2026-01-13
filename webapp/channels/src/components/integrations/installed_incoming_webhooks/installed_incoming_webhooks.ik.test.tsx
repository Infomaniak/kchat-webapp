import {shallow} from 'enzyme';
import type {ComponentProps} from 'react';
import React from 'react';

import type {IncomingWebhook} from '@mattermost/types/integrations';

import InstalledIncomingWebhooks from 'components/integrations/installed_incoming_webhooks/installed_incoming_webhooks';

import {TestHelper} from 'utils/test_helper';

describe('components/integrations/InstalledIncomingWebhooks', () => {
    const teamId = 'testteamid';
    const team = TestHelper.getTeamMock({id: teamId, name: 'test'});
    const user = TestHelper.getUserMock({
        id: 'user_id_1',
        username: 'sudheerdev',
        roles: 'system_user',
    });
    const channel = TestHelper.getChannelMock({
        id: 'channel_id_1',
        name: 'town-square',
        display_name: 'Town Square',
    });

    const incomingHooks = [
        {
            id: 'hook_1',
            channel_id: channel.id,
            user_id: user.id,
            create_at: 1502455422406,
            delete_at: 0,
            update_at: 1502455422406,
            display_name: 'hook one',
            description: 'desc one',
            team_id: team.id,
        } as unknown as IncomingWebhook,
        {
            id: 'hook_2',
            channel_id: channel.id,
            user_id: user.id,
            create_at: 1502455422406,
            delete_at: 0,
            update_at: 1502455422406,
            display_name: 'hook two',
            description: 'desc two',
            team_id: team.id,
        } as unknown as IncomingWebhook,
    ];

    const defaultProps: ComponentProps<typeof InstalledIncomingWebhooks> = {
        team,
        user,
        incomingHooks,
        incomingHooksTotalCount: incomingHooks.length,
        channels: {[channel.id]: channel},
        users: {[user.id]: user},
        canManageOthersWebhooks: true,
        enableIncomingWebhooks: true,
        isQuotaExceeded: false,
        actions: {
            removeIncomingHook: jest.fn(),
            loadIncomingHooksAndProfilesForTeam: jest.fn().mockResolvedValue({data: []}),
        },
    };

    test('should include incoming webhooks when filter matches creator username', () => {
        const wrapper = shallow<InstalledIncomingWebhooks>(
            <InstalledIncomingWebhooks {...defaultProps}/>,
        );

        expect(wrapper.instance().incomingWebhooks('sudheer').length).toBe(incomingHooks.length);
        expect(wrapper.instance().incomingWebhooks('no-match').length).toBe(0);
    });
});
