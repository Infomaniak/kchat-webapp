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
