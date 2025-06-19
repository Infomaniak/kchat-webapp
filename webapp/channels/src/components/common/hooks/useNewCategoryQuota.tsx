import React, {useRef} from 'react';

import useGetUsageDeltas from './useGetUsageDeltas';

export function useCategoryCreationWithLimitation(props: {onClick: () => void}) {
    const modalRef = useRef<any>(null);

    const openUpgradePopupOpen = () => {
        modalRef.current?.open();
    };

    const {sidebar_categories: remainingCategoryNegative} = useGetUsageDeltas();
    const available = remainingCategoryNegative < 0;
    const onClick = available ? props.onClick : openUpgradePopupOpen;

    let OptionalUpgradeButton = null;
    if (!available) {
        OptionalUpgradeButton = (
            <wc-ksuite-modal-conversion ref={modalRef}>
                <wc-modal-conversion-tag/>
            </wc-ksuite-modal-conversion>
        );
    }

    return {onClick, OptionalUpgradeButton};
}
