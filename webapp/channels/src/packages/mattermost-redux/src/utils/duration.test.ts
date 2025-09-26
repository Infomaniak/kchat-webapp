import type {IntlShape} from 'react-intl';

import {formatYMDDurationHuman} from './duration';

const createMockIntl = (locale: string): IntlShape => ({
    locale,

    // @ts-expect-error minimal mock for test purpose
    formatMessage: ({id}: { id: string }, values: { count: number }) => {
        const messages: Record<string, Record<string, [string, string]>> = {
            en: {
                'duration.year': ['year', 'years'],
                'duration.month': ['month', 'months'],
                'duration.day': ['day', 'days'],
            },
            fr: {
                'duration.year': ['an', 'ans'],
                'duration.month': ['mois', 'mois'],
                'duration.day': ['jour', 'jours'],
            },
            es: {
                'duration.year': ['año', 'años'],
                'duration.month': ['mes', 'meses'],
                'duration.day': ['día', 'días'],
            },
            de: {
                'duration.year': ['Jahr', 'Jahre'],
                'duration.month': ['Monat', 'Monate'],
                'duration.day': ['Tag', 'Tage'],
            },
            it: {
                'duration.year': ['anno', 'anni'],
                'duration.month': ['mese', 'mesi'],
                'duration.day': ['giorno', 'giorni'],
            },
        };

        const msg = messages[locale]?.[id] || ['?', '?'];
        return values.count === 1 ? msg[0] : msg[1];
    },
});

describe('formatYMDDurationHuman', () => {
    it('should format years, months and days in English', () => {
        expect(formatYMDDurationHuman('P1Y2M3D', createMockIntl('en'))).toBe('1 year 2 months 3 days');
        expect(formatYMDDurationHuman('P1Y', createMockIntl('en'))).toBe('1 year');
        expect(formatYMDDurationHuman('P10D', createMockIntl('en'))).toBe('10 days');
    });

    it('should format in French', () => {
        expect(formatYMDDurationHuman('P1Y2M3D', createMockIntl('fr'))).toBe('1 an 2 mois 3 jours');
        expect(formatYMDDurationHuman('P2M', createMockIntl('fr'))).toBe('2 mois');
    });

    it('should format in Spanish', () => {
        expect(formatYMDDurationHuman('P1Y1M1D', createMockIntl('es'))).toBe('1 año 1 mes 1 día');
    });

    it('should format in German', () => {
        expect(formatYMDDurationHuman('P3Y4M5D', createMockIntl('de'))).toBe('3 Jahre 4 Monate 5 Tage');
    });

    it('should format in Italian', () => {
        expect(formatYMDDurationHuman('P2Y3M', createMockIntl('it'))).toBe('2 anni 3 mesi');
    });

    it('should return empty string for invalid or zero durations', () => {
        expect(formatYMDDurationHuman('', createMockIntl('en'))).toBe('');
        expect(formatYMDDurationHuman('P0Y0M0D', createMockIntl('en'))).toBe('');
        expect(formatYMDDurationHuman('P', createMockIntl('en'))).toBe('');
    });

    it('should ignore time parts if present', () => {
        expect(formatYMDDurationHuman('P1Y2M3DT4H5M6S', createMockIntl('en'))).toBe('1 year 2 months 3 days');
    });
});

