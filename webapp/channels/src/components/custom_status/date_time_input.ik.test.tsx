// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {render} from '@testing-library/react';
import {DateTime} from 'luxon';
import moment from 'moment-timezone';
import React from 'react';
import {IntlProvider} from 'react-intl';
import {Provider} from 'react-redux';

import * as i18Selectors from 'selectors/i18n';

import mockStore from 'tests/test_store';

import DateTimeInput from './date_time_input';

jest.mock('selectors/i18n');

describe('components/custom_status/DateTimeInput - IK custom: en locale should use en-GB date format', () => {
    const renderWithIntl = (ui: React.ReactElement, store: ReturnType<typeof mockStore>) =>
        render(
            <Provider store={store}>
                <IntlProvider
                    locale='en'
                    messages={{}}
                >
                    {ui}
                </IntlProvider>
            </Provider>,
        );

    it('should format date with en-GB format when locale is "en"', () => {
        const testDate = moment('2024-03-15T10:30:00Z');

        // Mock the getCurrentLocale selector to return 'en'
        (i18Selectors.getCurrentLocale as jest.Mock).mockReturnValue('en');

        const store = mockStore({
            entities: {
                preferences: {
                    myPreferences: {},
                },
                general: {
                    config: {},
                },
                teams: {
                    currentTeamId: 'team1',
                },
                users: {
                    currentUserId: 'user1',
                    profiles: {},
                },
            },
        });

        const {container} = renderWithIntl(
            <DateTimeInput
                time={testDate}
                handleChange={jest.fn()}
                relativeDate={false}
            />,
            store,
        );

        // Find the date input field
        const dateInput = container.querySelector('#customStatus__calendar-input') as HTMLInputElement;
        const actualOutput = dateInput?.value;

        // Expected: en-GB format (DD/MM/YYYY) like "15/03/2024"
        const expectedEnGBFormat = DateTime.fromJSDate(testDate.toDate()).setLocale('en-GB').toLocaleString();

        // The component output must match en-GB format
        expect(actualOutput).toBe(expectedEnGBFormat);
    });
});
