/**
 * Returns kSuite redirect URL
 *
 * For example:
 * Origin   https://infomaniak.kchat.infomaniak.com/infomaniak/channels/town-square
 * Redirect https://ksuite.infomaniak.com/kchat/infomaniak/channels/town-square
 */

export function getKSuiteRedirect(
    location: Location,
    isIframe: boolean,
    isDesktopApp: boolean,
    isDev: boolean,
): string | null {
    if (isDev || isDesktopApp || isIframe || location.search.includes('ksuite-mode')) {
        return null;
    }

    const {hostname, pathname, search} = location;
    const isStaging = hostname.endsWith('infomaniak.ch');
    const targetOrigin = isStaging ? 'https://ksuite.preprod.dev.infomaniak.ch' : 'https://ksuite.infomaniak.com';

    return targetOrigin + '/kchat' + pathname + search;
}

// Note: checking the presence of window.top would never throw (due to cross-origin)
// But accessing deeper paths for example `window.top.location` would.
// Just being extra safe here ...
export function isInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        // If access is denied (due to cross-origin), assume it's framed
        return true;
    }
}
