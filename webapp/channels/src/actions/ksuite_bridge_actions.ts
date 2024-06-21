// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {DoNotDisturbMessage, KSuiteBridge} from '@infomaniak/ksuite-bridge';
import {AppReadyMessageKey, DoNotDisturbMessageKey, LogoutMessageKey} from '@infomaniak/ksuite-bridge';

import type {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {BridgeActionTypes} from 'utils/constants';

export function storeBridge(bridge: KSuiteBridge) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({
            type: BridgeActionTypes.STORE_BRIDGE,
            bridge,
        });

        bridge.sendMessage({
            type: AppReadyMessageKey,
        });

        bridge.on(DoNotDisturbMessageKey, (doNotDisturbMessage: DoNotDisturbMessage) => {
            if (doNotDisturbMessage.enabled !== getState().ksuite_bridge.dnd) {
                dispatch({
                    type: BridgeActionTypes.DND_CHANGE,
                    dnd: doNotDisturbMessage.enabled,
                });
            }
        });

        return {data: true};
    };
}
