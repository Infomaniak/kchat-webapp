// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {KSuiteBridge} from '@infomaniak/ksuite-bridge';
import {AppReadyMessageKey} from '@infomaniak/ksuite-bridge';

import type {DispatchFunc} from 'mattermost-redux/types/actions';

import {BridgeActionTypes} from 'utils/constants';

export function storeBridge(bridge: KSuiteBridge) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: BridgeActionTypes.STORE_BRIDGE,
            bridge,
        });

        bridge.sendMessage({
            type: AppReadyMessageKey,
        });

        return {data: true};
    };
}
