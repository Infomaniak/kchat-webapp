import {getKSuiteRedirect} from 'utils/url-ksuite-redirect';

const defaultLocation: Location = {
    ...global.window.location,
    hostname: 'https://infomaniak.kchat.infomaniak.com',
};

describe('getKSuiteRedirect', () => {
    it('should return null in development mode', () => {
        expect(getKSuiteRedirect(defaultLocation, false, false, true)).toBeNull();
    });

    it('should return null for desktop app', () => {
        expect(getKSuiteRedirect(defaultLocation, false, true, false)).toBeNull();
    });

    it('should return null if embedded in iframe', () => {
        expect(getKSuiteRedirect(defaultLocation, true, false, false)).toBeNull();
    });

    it('should return null if ksuite mode parameter is present', () => {
        expect(
            getKSuiteRedirect(
                {...defaultLocation, search: '?ksuite-mode'},
                false,
                false,
                false,
            ),
        ).toBeNull();
    });

    it('should return correct redirect URL for staging environment', () => {
        expect(
            getKSuiteRedirect(
                {
                    ...defaultLocation,
                    hostname:
                        'https://infomaniak.kchat.preprod.dev.infomaniak.ch',
                    pathname: '/test',
                    search: '?param=value',
                },
                false,
                false,
                false,
            ),
        ).toBe(
            'https://ksuite.preprod.dev.infomaniak.ch/kchat/test?param=value',
        );
    });

    it('should return correct redirect URL for production environment', () => {
        expect(
            getKSuiteRedirect(
                {
                    ...defaultLocation,
                    hostname: 'https://infomaniak.kchat.infomaniak.com',
                    pathname: '/test',
                    search: '?param=value',
                },
                false,
                false,
                false,
            ),
        ).toBe('https://ksuite.infomaniak.com/kchat/test?param=value');
    });
});
