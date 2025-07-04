import type {PackName} from '@mattermost/types/teams';

export type WcPackName = 'essential' | 'standard' | 'business' | 'entreprise';

const wcPlanMap: Record<PackName, WcPackName> = {
    ksuite_essential: 'essential',
    ksuite_standard: 'standard',
    ksuite_pro: 'business',
    ksuite_entreprise: 'entreprise',
};

const planOrder: PackName[] = [
    'ksuite_essential',
    'ksuite_standard',
    'ksuite_pro',
    'ksuite_entreprise',
];

export const getNextWcPack = (current: PackName | undefined): WcPackName => {
    const index = current ? planOrder.indexOf(current) : -1;
    const next =
        index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : planOrder[0];
    return wcPlanMap[next];
};

export const quotaGate = (
    remaining: number | boolean,
    currentPlan: PackName | undefined,
) => {
    const isQuotaExceeded =
        (typeof remaining === 'number' && remaining >= 0) ||
        (typeof remaining === 'boolean' && remaining === false);

    const openUpgradeDialog = (plan: WcPackName) => {
        customElements.whenDefined('wc-ksuite-pro-upgrade-dialog').then(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const wcModal = document.getElementById('wc-modal') as any; // no type for wc yet
            if (wcModal && typeof wcModal.open === 'function') {
                requestAnimationFrame(() => { // This is to make sure we don't have weird behavior with MUI menu closing the modal
                    wcModal.open(plan);
                });
            } else {
                // eslint-disable-next-line no-console
                console.warn('open() on <wc-ksuite-pro-upgrade-dialog id="wc-modal"> is not available.');
            }
        });
    };

    const withQuotaCheck = (cb: () => void) => {
        return () => {
            if (isQuotaExceeded) {
                const plan = getNextWcPack(currentPlan);
                openUpgradeDialog(plan);
            } else {
                cb();
            }
        };
    };

    return {isQuotaExceeded, withQuotaCheck};
};
