// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import type {ComponentProps} from 'react';
import React from 'react';

import {TestHelper} from 'utils/test_helper';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import PostProfilePicture from './post_profile_picture';

type Props = ComponentProps<typeof PostProfilePicture>;

describe('components/PostProfilePicture', () => {
    const user = TestHelper.getUserMock({
        id: 'defaultuser',
    });
    const post = TestHelper.getPostMock({
        user_id: 'defaultuser',
    });

    const baseProps: Props = {
        availabilityStatusOnPosts: 'true',
        enablePostIconOverride: true,
        compactDisplay: true,
        hasImageProxy: true,
        post,
        user,
        isBot: Boolean(user.is_bot),
    };

    test('should match snapshot, no status and post icon override specified, default props', () => {
        const props: Props = baseProps;
        renderWithContext(
            <PostProfilePicture {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('status is specified, default props', () => {
        const props: Props = {
            ...baseProps,
            status: 'away',
        };
        renderWithContext(
            <PostProfilePicture {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
