// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import DateSeparator from './date_separator';

describe('components/post_view/DateSeparator', () => {
    const initialState = {
        entities: {
            general: {
                config: {},
            },
            preferences: {
                myPreferences: {},
            },
        },
    } as any;
    test('should render Timestamp inside of a BasicSeparator and pass date/value to it', () => {
        const value = new Date('Fri Jan 12 2018 20:15:13 GMT+1200 (+12)');
        renderWithContext(
            <DateSeparator
                date={value}
            />, initialState,
        );

        expect(screen.getByTestId('basicSeparator')).toBeInTheDocument();

        expect(screen.getByText('January 12, 2018')).toBeInTheDocument();
    });
});
