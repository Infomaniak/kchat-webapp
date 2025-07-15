import {Duration} from 'luxon';
import type {IntlShape} from 'react-intl';

type Unit = 'years' | 'months' | 'days';

const units: Array<[Unit, string]> = [
    ['years', 'duration.year'],
    ['months', 'duration.month'],
    ['days', 'duration.day'],
];

export function formatYMDDurationHuman(
    iso: string,
    intl: IntlShape,
): string {
    const dur = Duration.fromISO(iso);
    const nf = new Intl.NumberFormat(intl.locale);

    return units.
        map(([key, id]) => {
            const val = dur[key];
            if (!val) {
                return null;
            }

            const label = intl.formatMessage(
                {id, defaultMessage: '{count, plural, one {#} other {#s}}'},
                {count: val},
            );

            return `${nf.format(val)} ${label}`;
        }).
        filter(Boolean).
        join(' ');
}
