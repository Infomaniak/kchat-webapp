import {Duration} from 'luxon';
import {defineMessages} from 'react-intl';
import type {IntlShape} from 'react-intl';

type Unit = 'years' | 'months' | 'days';

const messages = defineMessages({
    year: {
        id: 'duration.year',
        defaultMessage: '{count, plural, one {#} other {#s}}',
    },
    month: {
        id: 'duration.month',
        defaultMessage: '{count, plural, one {#} other {#s}}',
    },
    day: {
        id: 'duration.day',
        defaultMessage: '{count, plural, one {#} other {#s}}',
    },
});

const units: Array<[Unit, keyof typeof messages]> = [
    ['years', 'year'],
    ['months', 'month'],
    ['days', 'day'],
];

export function formatYMDDurationHuman(
    iso: string,
    intl: IntlShape,
): string {
    const dur = Duration.fromISO(iso);
    const nf = new Intl.NumberFormat(intl.locale);

    return units.
        map(([key, messageKey]) => {
            const val = dur[key];
            if (!val) {
                return null;
            }

            const label = intl.formatMessage(
                messages[messageKey],
                {count: val},
            );

            return `${nf.format(val)} ${label}`;
        }).
        filter(Boolean).
        join(' ');
}
