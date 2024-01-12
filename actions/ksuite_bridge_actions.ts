// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppReadyMessageKey, type KSuiteBridge} from '@infomaniak/ksuite-bridge';

import {DispatchFunc} from 'mattermost-redux/types/actions';
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
