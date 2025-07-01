import type {PackName} from '@mattermost/types/teams';

import {
    getNextPackName,
    getNextWcPackName,
} from './plans_util'; // Remplace par le bon chemin

describe('Plan Navigation', () => {
    it.each([
        ['ksuite_essential', 'ksuite_standard'],
        ['ksuite_standard', 'ksuite_pro'],
        ['ksuite_pro', 'ksuite_entreprise'],
        ['ksuite_entreprise', 'ksuite_entreprise'],
    ] as Array<[PackName, PackName]>)(
        'getNextPack(%s) → %s',
        (input, expected) => {
            expect(getNextPackName(input)).toBe(expected);
        },
    );

    it.each([
        ['ksuite_essential', 'standard'],
        ['ksuite_standard', 'business'],
        ['ksuite_pro', 'entreprise'],
        ['ksuite_entreprise', 'entreprise'],
    ] as Array<[PackName, ReturnType<typeof getNextWcPackName>]>)(
        'getNextWcPlan(%s) → %s',
        (input, expected) => {
            expect(getNextWcPackName(input)).toBe(expected);
        },
    );

    it('throws on unknown PackName in getNextWcPlan', () => {
        const unknown = 'ksuite_unknown' as PackName;
        expect(() => getNextWcPackName(unknown)).toThrow();
    });

    it('returns input unchanged if unknown PackName in getNextPackName', () => {
        const unknown = 'ksuite_unknown' as PackName;
        expect(getNextPackName(unknown)).toBe(unknown);
    });
});
