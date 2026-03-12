// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import nock from 'nock';

import * as Actions from 'mattermost-redux/actions/groups';
import {Client4} from 'mattermost-redux/client';

import TestHelper from '../../test/test_helper';
import configureStore from '../../test/test_store';

describe('Actions.Groups', () => {
    let store = configureStore();

    beforeEach(() => {
        TestHelper.initBasic(Client4);
        store = configureStore();
    });

    afterEach(() => {
        TestHelper.tearDown();
    });

    // IK: backend returns Group[] directly instead of {groups, total_group_count}
    it('getGroupsAssociatedToChannel', async () => {
        const channelID = '5rgoajywb3nfbdtyafbod47ryb';

        const response = [
            {
                id: 'tnd8zod9f3fdtqosxjmhwucbth',
                name: 'software-engineering',
                display_name: 'software engineering',
                description: '',
                source: 'ldap',
                remote_id: 'engineering',
                create_at: 1553808971099,
                update_at: 1553808971099,
                delete_at: 0,
                has_syncables: false,
                member_count: 8,
                allow_reference: false,
            },
            {
                id: 'qhdp6g7aubbpiyja7c4sgpe7tc',
                name: 'qa',
                display_name: 'qa',
                description: '',
                source: 'ldap',
                remote_id: 'qa',
                create_at: 1553808971548,
                update_at: 1553808971548,
                delete_at: 0,
                has_syncables: false,
                member_count: 2,
                allow_reference: true,
            },
        ];

        nock(Client4.getBaseRoute()).
            get(`/channels/${channelID}/groups?page=100&per_page=60&q=0&include_member_count=true&filter_allow_reference=false`).
            reply(200, response);

        await store.dispatch(Actions.getGroupsAssociatedToChannel(channelID, '0', 100));

        const state = store.getState();

        const groupIDs = state.entities.channels.groupsAssociatedToChannel[channelID].ids;
        const expectedIDs = ['tnd8zod9f3fdtqosxjmhwucbth', 'qhdp6g7aubbpiyja7c4sgpe7tc'];
        expect(groupIDs.length).toEqual(expectedIDs.length);
        groupIDs.forEach((id: string) => {
            expect(expectedIDs.includes(id)).toBeTruthy();
            expect(state.entities.groups.groups[id]).toBeTruthy();
        });

        const count = state.entities.channels.groupsAssociatedToChannel[channelID].totalCount;
        expect(count).toEqual(response.length);
    });
});
