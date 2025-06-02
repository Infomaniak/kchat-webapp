/**
 * Returns kSuite redirect URL
 *
 * For example:
 * Origin   https://infomaniak.kchat.infomaniak.com/infomaniak/channels/town-square
 * Redirect https://ksuite.infomaniak.com/kchat/infomaniak/channels/town-square
 */

export function getKSuiteRedirect(
    location: Location,
    isDesktopApp: boolean,
    isDev: boolean,
): string | null {
    if (isDev || isDesktopApp || location.search.includes('ksuite-mode')) {
        return null;
    }

    const {hostname, pathname, search} = location;
    const isStaging = hostname.endsWith('infomaniak.ch');
    const targetOrigin = isStaging ? 'https://ksuite.preprod.dev.infomaniak.ch' : 'https://ksuite.infomaniak.com';

    return targetOrigin + '/kchat' + pathname + search;
}
