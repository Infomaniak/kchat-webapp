// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// import LocalStorageStore from 'stores/local_storage_store';

import type {GlobalState} from 'types/store';

export function getInfomaniakTokens(state: GlobalState): { accessToken: string; refreshToken: string } {
    return state.views.ik;
}
