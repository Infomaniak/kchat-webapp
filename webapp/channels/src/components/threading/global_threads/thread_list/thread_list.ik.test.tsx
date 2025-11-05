// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import type {ComponentProps} from 'react';

import NoResultsIndicator from 'components/no_results_indicator';
import IkReadThreadIllustration from 'components/threading/common/ik_read_thread_illustration';

import {WindowSizes} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import ThreadList, {ThreadFilter} from './thread_list';

const mockRouting = {
    currentUserId: 'uid',
    currentTeamId: 'tid',
    goToInChannel: jest.fn(),
    select: jest.fn(),
    clear: jest.fn(),
};
jest.mock('../../hooks', () => {
    return {
        useThreadRouting: () => mockRouting,
    };
});

const mockDispatch = jest.fn();
let mockState: any;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

describe('components/threading/global_threads/thread_list - Infomaniak specific tests', () => {
    let props: ComponentProps<typeof ThreadList>;

    beforeEach(() => {
        const user = TestHelper.getUserMock();
        const profiles = {
            [user.id]: user,
        };

        mockState = {
            entities: {
                users: {
                    currentUserId: user.id,
                    profiles,
                },
                preferences: {
                    myPreferences: {},
                },
                threads: {
                    countsIncludingDirect: {
                        tid: {
                            total: 0,
                            total_unread_threads: 0,
                            total_unread_mentions: 0,
                        },
                    },
                },
                teams: {
                    currentTeamId: 'tid',
                },
            },
            views: {
                browser: {
                    windowSize: WindowSizes.DESKTOP_VIEW,
                },
            },
        };

        props = {
            currentFilter: ThreadFilter.unread,
            someUnread: false,
            ids: ['1', '2', '3'],
            unreadIds: [],
            setFilter: jest.fn(),
        };
    });

    test('NoResultsIndicator uses IkReadThreadIllustration as iconGraphic', () => {
        const wrapper = shallow(
            <ThreadList {...props}/>,
        );

        const noResultsIndicator = wrapper.find(NoResultsIndicator);
        const iconGraphic = noResultsIndicator.prop('iconGraphic');

        expect(iconGraphic).toEqual(<IkReadThreadIllustration/>);
    });
});
