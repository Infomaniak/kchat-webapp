// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {createIntl} from 'react-intl';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import Timestamp from './timestamp';

describe('components/timestamp/Timestamp - IK custom: en locale should use en-GB date format', () => {
    it('should format date with en-GB format when locale is "en"', () => {
        const testDate = new Date('2024-03-15T10:30:00Z');

        // Render the actual Timestamp component with locale 'en'
        const wrapper = mountWithIntl(
            <Timestamp
                value={testDate}
                useRelative={false}
                useTime={false}
                useSemanticOutput={false}
            />,
            {
                intl: createIntl({
                    locale: 'en',
                    defaultLocale: 'en',
                }),
            },
        );

        const actualOutput = wrapper.text();

        // Expected: en-GB format like "15 March 2024" (day before month)
        const expectedEnGBFormat = new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        }).format(testDate);

        // The component output must match en-GB format
        expect(actualOutput).toBe(expectedEnGBFormat);
    });
});
