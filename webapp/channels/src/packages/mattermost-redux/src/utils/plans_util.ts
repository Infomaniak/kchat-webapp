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

const paidPlans: PackName[] = ['ksuite_standard', 'ksuite_entreprise', 'ksuite_pro'];

export const getNextWcPack = (current: PackName | undefined): WcPackName => {
    const currentIndex = current ? planOrder.indexOf(current) : -1;

    const isLastOrUnknown = currentIndex === -1 || currentIndex === planOrder.length - 1;
    const nextIndex = isLastOrUnknown ? 0 : currentIndex + 1;

    return wcPlanMap[planOrder[nextIndex]];
};

export const isPaidPlan = (plan: PackName | undefined): boolean => {
    if (!plan) {
        return false;
    }
    return paidPlans.includes(plan);
};

export const isHighestTier = (plan: PackName | undefined): boolean => {
    if (!plan) {
        return false;
    }
    return planOrder[planOrder.length - 1] === plan;
};

// Helper when we cannot use the hook useGetUsageDeltas
// eg: mapStateToProps
export function isQuotaExceeded(
    usage: number,
    maybeLimit?: number,
): boolean {
    if (maybeLimit === -1 || maybeLimit === undefined) {
        return false;
    }

    return usage >= maybeLimit;
}

export const quotaGate = (
    overQuotaDelta: number | boolean, // >0 = over quota | <0 = slots remaining
    currentPlan: PackName | undefined,
) => {
    const isQuotaExceeded =
        (typeof overQuotaDelta === 'number' && overQuotaDelta >= 0) ||
        (typeof overQuotaDelta === 'boolean' && overQuotaDelta === false);

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

export const openUpgradeDialog = (plan: WcPackName) => {
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
