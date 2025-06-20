import {useRef} from 'react';

import type {PackFeatureConfig} from 'mattermost-redux/utils/getPackLimitedFeature';
import {getPackLimitedFeature} from 'mattermost-redux/utils/getPackLimitedFeature';

export function usePackLimitedFeature<T>(config: Omit<PackFeatureConfig<T>, 'modalRef'>) {
    const modalRef = useRef<any>(null);

    const {onClick, Label, Modal} = getPackLimitedFeature({
        ...config,
        modalRef,
    });

    return {onClick, Label, OptionalUpgradeModal: Modal, modalRef};
}
