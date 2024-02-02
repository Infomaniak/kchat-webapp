
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from 'types/store';

type Toast = {
    message: string;
    props?: {
        link: string;
    };
}

export function getKDriveToast(state: GlobalState): Toast {
    return state.kdrive.toast;
}
