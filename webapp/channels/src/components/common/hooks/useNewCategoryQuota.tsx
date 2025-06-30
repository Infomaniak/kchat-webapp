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
    const available = packaName !== 'ksuite_essential' || remainingCategoryNegative < 0;
    const onClick = available ? props.onClick : openUpgradePopupOpen;

    let OptionalUpgradeButton = null;
    if (!available) {
        OptionalUpgradeButton = (
            <wc-ksuite-pro-upgrade-dialog
                ref={modalRef}
                offer='standard'
            >
                <wc-ksuite-pro-upgrade-tag slot='trigger-element'/>
            </wc-ksuite-pro-upgrade-dialog>
        );
    }

    return {onClick, OptionalUpgradeButton};
}
