import {formatYMDDurationHuman} from './duration';

describe('formatYMDDurationHuman', () => {
    it('should format years, months and days in English', () => {
        expect(formatYMDDurationHuman('P1Y2M3D', 'en')).toBe('1 year 2 months 3 days');
        expect(formatYMDDurationHuman('P1Y', 'en')).toBe('1 year');
        expect(formatYMDDurationHuman('P10D', 'en')).toBe('10 days');
    });

    it('should format in French', () => {
        expect(formatYMDDurationHuman('P1Y2M3D', 'fr')).toBe('1 an 2 mois 3 jours');
        expect(formatYMDDurationHuman('P2M', 'fr')).toBe('2 mois');
    });

    it('should format in Spanish', () => {
        expect(formatYMDDurationHuman('P1Y1M1D', 'es')).toBe('1 año 1 mes 1 día');
    });

    it('should format in German', () => {
        expect(formatYMDDurationHuman('P3Y4M5D', 'de')).toBe('3 Jahre 4 Monate 5 Tage');
    });

    it('should format in Italian', () => {
        expect(formatYMDDurationHuman('P2Y3M', 'it')).toBe('2 anni 3 mesi');
    });

    it('should return empty string for invalid or zero durations', () => {
        expect(formatYMDDurationHuman('', 'en')).toBe('');
        expect(formatYMDDurationHuman('P0Y0M0D', 'en')).toBe('');
        expect(formatYMDDurationHuman('P', 'en')).toBe('');
    });

    it('should ignore time parts if present', () => {
        expect(formatYMDDurationHuman('P1Y2M3DT4H5M6S', 'en')).toBe('1 year 2 months 3 days');
    });
});

describe('formatYMDDurationHuman - singular/plural', () => {
    const cases = [
        ['P1Y', 'en', '1 year'],
        ['P2Y', 'en', '2 years'],
        ['P1M', 'en', '1 month'],
        ['P3M', 'en', '3 months'],
        ['P1D', 'en', '1 day'],
        ['P5D', 'en', '5 days'],

        ['P1Y', 'fr', '1 an'],
        ['P2Y', 'fr', '2 ans'],
        ['P1M', 'fr', '1 mois'],
        ['P3M', 'fr', '3 mois'],
        ['P1D', 'fr', '1 jour'],
        ['P4D', 'fr', '4 jours'],

        ['P1Y', 'es', '1 año'],
        ['P2Y', 'es', '2 años'],
        ['P1M', 'es', '1 mes'],
        ['P2M', 'es', '2 meses'],
        ['P1D', 'es', '1 día'],
        ['P7D', 'es', '7 días'],

        ['P1Y', 'de', '1 Jahr'],
        ['P2Y', 'de', '2 Jahre'],
        ['P1M', 'de', '1 Monat'],
        ['P3M', 'de', '3 Monate'],
        ['P1D', 'de', '1 Tag'],
        ['P9D', 'de', '9 Tage'],

        ['P1Y', 'it', '1 anno'],
        ['P2Y', 'it', '2 anni'],
        ['P1M', 'it', '1 mese'],
        ['P3M', 'it', '3 mesi'],
        ['P1D', 'it', '1 giorno'],
        ['P8D', 'it', '8 giorni'],
    ];

    cases.forEach(([iso, locale, expected]) => {
        it(`formats ${iso} in ${locale} as "${expected}"`, () => {
            expect(formatYMDDurationHuman(iso as string, locale as string)).toBe(expected);
        });
    });
});
