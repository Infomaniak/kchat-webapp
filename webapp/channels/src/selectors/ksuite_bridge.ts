
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {KSuiteBridge} from '@infomaniak/ksuite-bridge';

import type {GlobalState} from 'types/store';

export function getKSuiteBridge(state: GlobalState): KSuiteBridge {
    return state.ksuite_bridge.bridge;
}
