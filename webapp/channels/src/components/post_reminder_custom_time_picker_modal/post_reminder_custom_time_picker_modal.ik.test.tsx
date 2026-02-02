import {render} from '@testing-library/react';
import moment from 'moment-timezone';
import React from 'react';
import {IntlProvider} from 'react-intl';

import PostReminderCustomTimePicker from './post_reminder_custom_time_picker_modal';

let lastDateTimePickerProps: any;

jest.mock('components/date_time_picker_modal/date_time_picker_modal', () => {
    return {
        __esModule: true,
        default: (props: any) => {
            lastDateTimePickerProps = props;
            return null;
        },
    };
});

jest.mock('utils/datetime', () => ({
    toUTCUnixInSeconds: jest.fn(() => 1234567890),
}));

describe('components/post_reminder_custom_time_picker_modal - IK postpone', () => {
    beforeEach(() => {
        lastDateTimePickerProps = undefined;
        jest.clearAllMocks();
    });

    it('calls addPostReminder with reschedule=true and reminderPostId when postpone=true', () => {
        const addPostReminder = jest.fn();

        render(
            <IntlProvider
                locale='en'
                messages={{}}
            >
                <PostReminderCustomTimePicker
                    userId='user-id'
                    timezone='UTC'
                    onExited={jest.fn()}
                    postId='post-id'
                    postpone={true}
                    reminderPostId='reminder-post-id'
                    actions={{addPostReminder}}
                />
            </IntlProvider>,
        );

        expect(lastDateTimePickerProps).toBeTruthy();

        const dateTime = moment('2026-01-20T10:00:00Z');
        lastDateTimePickerProps.onConfirm(dateTime);

        expect(addPostReminder).toHaveBeenCalledTimes(1);
        expect(addPostReminder).toHaveBeenCalledWith(
            'user-id',
            'post-id',
            {type: 'custom', value: 1234567890},
            true,
            'reminder-post-id',
        );
    });
});
