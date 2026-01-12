// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch} from 'react-redux';

import {openModal} from 'actions/views/modals';

import {ModalIdentifiers} from 'utils/constants';

type Props = any;
const TrialBenefitsModal = null;

interface Options {
    trialJustStarted?: boolean;
}

export default function useOpenTrialBenefitsModal(options: Options) {
    const dispatch = useDispatch();
    const dialogProps: Omit<Props, 'onExited'> = {};
    if (options.trialJustStarted) {
        dialogProps.trialJustStarted = true;
    }
    return () => {
        return dispatch(openModal({
            modalId: ModalIdentifiers.TRIAL_BENEFITS_MODAL,
            dialogType: TrialBenefitsModal,
            dialogProps,
        }));
    };
}
