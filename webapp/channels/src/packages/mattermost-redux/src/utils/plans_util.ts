import type {PackName} from '@mattermost/types/teams';

type WcPackName = 'essential' | 'standard' | 'business' | 'enterprise';

const planOrder: PackName[] = [
    'ksuite_essential',
    'ksuite_standard',
    'ksuite_pro',
    'ksuite_entreprise',
];

const wcPlanMap: Record<PackName, WcPackName> = {
    ksuite_essential: 'essential',
    ksuite_standard: 'standard',
    ksuite_pro: 'business',
    ksuite_entreprise: 'enterprise',
};

const toWcPlan = (pack: PackName): WcPackName => {
    const mapped = wcPlanMap[pack];
    if (!mapped) {
        throw new Error(`Unknown PackName: ${pack}`);
    }
    return mapped;
};

export const getNextPackName = (current: PackName): PackName => {
    const index = planOrder.indexOf(current);
    if (index === -1) {
        return current;
    }
    return index < planOrder.length - 1 ? planOrder[index + 1] : current;
};

export const getNextWcPackName = (current: PackName): WcPackName =>
    toWcPlan(getNextPackName(current));
