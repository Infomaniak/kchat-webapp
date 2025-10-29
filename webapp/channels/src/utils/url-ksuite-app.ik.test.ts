import {extractKSuiteAppName} from 'utils/url-ksuite-app';

describe('extractKSuiteAppName', () => {
    const exp = (url: string) => expect(extractKSuiteAppName(url));

    test('prioritizes app name from path', () => {
        exp('https://ksuite.infomaniak.com').toBe('ksuite');
        exp('https://ksuite.infomaniak.com/28').toBe('ksuite');
        exp('https://ksuite.infomaniak.com/mail').toBe('mail');
        exp('https://ksuite.infomaniak.com/28/mail').toBe('mail');
        exp('https://ksuite.infomaniak.com/all/mail').toBe('mail');
    });

    test('returns app name from pathname without spaceId', () => {
        exp('https://ksuite.infomaniak.com/kdrive').toBe('kdrive');
        exp('https://ksuite.infomaniak.com/mail').toBe('mail');
        exp('https://ksuite.infomaniak.com/kmeet').toBe('kmeet');

        exp('https://ksuite.preprod.dev.infomaniak.ch/kdrive').toBe('kdrive');
        exp('https://ksuite.preprod.dev.infomaniak.ch/mail').toBe('mail');
        exp('https://ksuite.preprod.dev.infomaniak.ch/kmeet').toBe('kmeet');
    });

    test('returns app name from pathname (without spaceId)', () => {
        exp('https://ksuite.infomaniak.com/kdrive').toBe('kdrive');
        exp('https://ksuite.infomaniak.com/mail').toBe('mail');
        exp('https://ksuite.infomaniak.com/kmeet').toBe('kmeet');

        exp('https://ksuite.preprod.dev.infomaniak.ch/kdrive').toBe('kdrive');
        exp('https://ksuite.preprod.dev.infomaniak.ch/mail').toBe('mail');
        exp('https://ksuite.preprod.dev.infomaniak.ch/kmeet').toBe('kmeet');
    });

    test('returns app name from second pathname segment (with spaceId)', () => {
        exp('https://ksuite.infomaniak.com/28/kdrive').toBe('kdrive');
        exp('https://ksuite.infomaniak.com/28/mail').toBe('mail');
        exp('https://ksuite.infomaniak.com/28/kmeet').toBe('kmeet');

        exp('https://ksuite.infomaniak.com/all/kdrive').toBe('kdrive');
        exp('https://ksuite.infomaniak.com/all/mail').toBe('mail');
        exp('https://ksuite.infomaniak.com/all/kmeet').toBe('kmeet');
    });

    test('returns app name from subdomain', () => {
        exp('https://kdrive.infomaniak.com').toBe('kdrive');
        exp('https://mail.infomaniak.com').toBe('mail');
        exp('https://euria.app.ksuite.infomaniak.com').toBe('euria');
    });

    test('returns null for invalid or malformed URLs', () => {
        exp('').toBeNull();
        exp('invalid-url').toBeNull();
        exp('https://ksuites.infomaniak.com').toBeNull();
    });

    test('is not case-sensitive ', () => {
        exp('https://ksuite.infomaniak.com/KDRIVE').toBe('kdrive');
        exp('https://KDRIVE.infomaniak.com').toBe('kdrive');
    });
});
