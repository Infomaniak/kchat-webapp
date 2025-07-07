import type {PackName} from '@mattermost/types/teams';

import {getNextWcPack, quotaGate} from './plans_util';

// Safe once-only definition
if (!customElements.get('wc-ksuite-pro-upgrade-dialog')) {
    class FakeUpgradeDialog extends HTMLElement {
        open = jest.fn();
    }
    customElements.define('wc-ksuite-pro-upgrade-dialog', FakeUpgradeDialog);
}

describe('getNextWcPack', () => {
    it.each([
        ['ksuite_essential', 'standard'],
        ['ksuite_standard', 'business'],
        ['ksuite_pro', 'entreprise'],
        ['ksuite_entreprise', 'essential'],
    ] as Array<[PackName | undefined, string]>)(
        'getNextWcPack(%s) → %s',
        (input, expected) => {
            expect(getNextWcPack(input)).toBe(expected);
        },
    );
});

describe('quotaGate', () => {
    beforeEach(() => {
        const el = document.createElement('wc-ksuite-pro-upgrade-dialog');
        el.id = 'wc-modal';
        (el as any).open = jest.fn();
        document.body.appendChild(el);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it.each([
        [10, true],
        [0, true],
        [-1, false],
        [false, true],
        [true, false],
    ])('isQuotaExceeded(%s) → %s', (input, expected) => {
        const result = quotaGate(input, 'ksuite_essential');
        expect(result.isQuotaExceeded).toBe(expected);
    });

    it('calls cb if quota not exceeded', () => {
        const cb = jest.fn();
        const {withQuotaCheck} = quotaGate(-1, 'ksuite_essential');
        const wrapped = withQuotaCheck(cb);
        wrapped();
        expect(cb).toHaveBeenCalled();
    });

    it('opens upgrade modal if quota exceeded', async () => {
        const cb = jest.fn();
        const {withQuotaCheck} = quotaGate(0, 'ksuite_standard');
        const wrapped = withQuotaCheck(cb);

        jest.useFakeTimers();
        wrapped();

        await customElements.whenDefined('wc-ksuite-pro-upgrade-dialog');
        jest.runAllTimers();

        const modal = document.getElementById('wc-modal') as any;
        expect(modal.open).toHaveBeenCalledWith('business');
        expect(cb).not.toHaveBeenCalled();

        jest.useRealTimers();
    });
});
