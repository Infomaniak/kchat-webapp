import React, {useRef} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';

import useGetUsageDeltas from './useGetUsageDeltas';

export function useCategoryCreationWithLimitation(props: {onClick: () => void}) {
    const modalRef = useRef<any>(null);

    const openUpgradePopupOpen = () => {
        modalRef.current?.open();
    };
    const packaName = useSelector(getCurrentPackName);
    const {sidebar_categories: remainingCategoryNegative} = useGetUsageDeltas();
    const available = remainingCategoryNegative < 0 && packaName === 'ksuite_essential';
    const onClick = available ? props.onClick : openUpgradePopupOpen;

    let OptionalUpgradeButton = null;
    if (!available) {
        OptionalUpgradeButton = (
            <wc-ksuite-modal-conversion
                ref={modalRef}
                modalType='standard'
            >
                <wc-modal-conversion-tag/>
            </wc-ksuite-modal-conversion>
        );
    }

    return {onClick, OptionalUpgradeButton};
}
