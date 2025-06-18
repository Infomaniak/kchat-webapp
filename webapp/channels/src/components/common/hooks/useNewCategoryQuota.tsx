import React from 'react';

import {UpgradeBtn} from 'components/ik_upgrade_btn/ik_upgrade_btn';

import useGetUsageDeltas from './useGetUsageDeltas';

export function useCategoryCreationWithLimitation(props: {onClick: () => void}) {
    const openUpgradePopupOpen = () => {
        alert('Woo, tu veux pas un kSuite PRO ?');
    };

    const {sidebar_categories: remainingCategoryNegative} = useGetUsageDeltas();
    const available = remainingCategoryNegative < 0;
    const onClick = available ? props.onClick : openUpgradePopupOpen;

    let OptionalUpgradeButton = null;
    if (!available) {
        OptionalUpgradeButton = <UpgradeBtn/>;
    }

    return {onClick, OptionalUpgradeButton};
}
