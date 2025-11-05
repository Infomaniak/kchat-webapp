// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import NoResultsIndicator from 'components/no_results_indicator';
import IkNoThreadIllustration from 'components/threading/common/ik_no_thread_illustration';

jest.mock('../thread_viewer', () => ({
    __esModule: true,
    default: () => null,
}));

import GlobalThreads from './global_threads';

const mockRouting = {
    currentUserId: 'uid',
    currentTeamId: 'tid',
    clear: jest.fn(),
};
jest.mock('../hooks', () => {
    return {
        useThreadRouting: () => mockRouting,
    };
});

const mockRouteMatch = {
    url: '/team/threads',
    params: {},
};
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useRouteMatch: () => mockRouteMatch,
}));

const mockDispatch = jest.fn();
let mockState: any;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
    shallowEqual: jest.fn(),
}));

jest.mock('stores/hooks', () => ({
    useGlobalState: () => ['none', jest.fn()],
}));

describe('components/threading/global_threads - Infomaniak specific tests', () => {
    beforeEach(() => {
        mockState = {
            entities: {
                posts: {
                    posts: {},
                },
                threads: {
                    threads: {},
                    threadsInTeam: {
                        tid: [],
                    },
                    counts: {
                        tid: {
                            total: 0,
                            total_unread_threads: 0,
                            total_unread_mentions: 0,
                        },
                    },
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
                threads: {
                    selectedThreadIdInTeam: {},
                },
            },
        };
    });

    test('NoResultsIndicator uses IkNoThreadIllustration as iconGraphic', () => {
        const wrapper = shallow(<GlobalThreads/>);

        // Debug pour voir la structure
        // eslint-disable-next-line no-console
        console.log('Wrapper debug:', wrapper.debug());

        const noResultsIndicators = wrapper.find(NoResultsIndicator);

        // eslint-disable-next-line no-console
        console.log('Found NoResultsIndicators:', noResultsIndicators.length);

        // Le deuxième NoResultsIndicator devrait avoir IkNoThreadIllustration
        const threadPaneIndicator = noResultsIndicators.filterWhere((node) => {
            const iconGraphic = node.prop('iconGraphic');
            return Boolean(iconGraphic && typeof iconGraphic === 'object' && 'type' in iconGraphic && iconGraphic.type === IkNoThreadIllustration);
        });

        expect(threadPaneIndicator).toHaveLength(1);
    });
});
