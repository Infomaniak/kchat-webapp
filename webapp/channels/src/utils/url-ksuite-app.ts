
import type {AppName} from '@infomaniak/ksuite-bridge';

export type KSuiteAppName = AppName | 'ksuite' | 'euria';

export const KSUITE_APP_NAMES: KSuiteAppName[] = [
    'ksuite',
    'mail',
    'kdrive',
    'kchat',
    'calendar',
    'contacts',
    'kmeet',
    'swisstransfer',
    'kpaste',
    'chk',
    'euria',
];

export function isKSuiteAppName(string?: string): string is KSuiteAppName {
    return typeof string === 'string' && KSUITE_APP_NAMES.includes(string as KSuiteAppName);
}

export function extractKSuiteAppName(url: string): KSuiteAppName | null {
    try {
        const {hostname, pathname} = new URL(url);

        const hostnameSegments = hostname.split('.').filter(Boolean).map((it) => it.toLowerCase());
        const pathnameSegments = pathname.split('/').filter(Boolean).map((it) => it.toLowerCase());

        // e.g. /kdrive
        if (isKSuiteAppName(pathnameSegments[0])) {
            return pathnameSegments[0];
        }

        // e.g. /28/kdrive
        if (isKSuiteAppName(pathnameSegments[1])) {
            return pathnameSegments[1];
        }

        // e.g. kdrive.infomaniak.com
        if (isKSuiteAppName(hostnameSegments[0])) {
            return hostnameSegments[0];
        }

        return null;
    } catch {
        return null;
    }
}
