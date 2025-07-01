import type {ReactElement} from 'react';

import type {PackName} from '@mattermost/types/teams';

type WcPackName = 'essential' | 'standard' | 'business' | 'entreprise';

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
    ksuite_entreprise: 'entreprise',
};

const toWcPlan = (pack: PackName): WcPackName => {
    const mapped = wcPlanMap[pack];
    if (!mapped) {
        throw new Error(`Unknown PackName: ${pack}`);
    }
    return mapped;
};

export const getNextPackName = (current: PackName | undefined): PackName => {
    if (!current) {
        return planOrder[0];
    }
    const index = planOrder.indexOf(current);
    if (index === -1) {
        return current;
    }
    return index < planOrder.length - 1 ? planOrder[index + 1] : current;
};

export const getNextWcPackName = (current: PackName | undefined): WcPackName =>
    toWcPlan(getNextPackName(current));

export const isQuotaExceeded = (
    remaining: number | boolean,
    enabledContent: ReactElement,
    disabledContent: ReactElement,
    onAllowedClick: () => void,
) => {
    const isLimitReached = (
        (typeof remaining === 'number' && remaining >= 0) ||
        (typeof remaining === 'boolean' && remaining === false)
    );

    return {
        component: isLimitReached ? disabledContent : enabledContent,
        onClick: isLimitReached ? () => {} : onAllowedClick,
    };
};
