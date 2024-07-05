// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {DoNotDisturbMessage, KSuiteBridge} from '@infomaniak/ksuite-bridge';
import {AppReadyMessageKey, DoNotDisturbMessageKey, RecreateMessageKey} from '@infomaniak/ksuite-bridge';

import type {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {BridgeActionTypes, BridgeParamWhitelist} from 'utils/constants';

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

export function bridgeRecreate(url: string) {
    return (_: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const urlObj = new URL(url);
        const bridge = state.ksuite_bridge.bridge;
        const ksuiteMode = state.ksuite_bridge.ksuiteMode;
        const spaceId = state.ksuite_bridge.spaceId;
        if (ksuiteMode) {
            urlObj.searchParams.append('ksuite-mode', ksuiteMode);
        }
        if (spaceId) {
            urlObj.searchParams.append('space-id', spaceId);
        }

        bridge.sendMessage({type: RecreateMessageKey, url: urlObj.toString()});
    };
}

export function storeBridgeParam(name: string, value: string) {
    return (dispatch: DispatchFunc) => {
        if (BridgeParamWhitelist.includes(name)) {
            dispatch({
                type: BridgeActionTypes.UPDATE_PARAMS_DATA,
                [name]: value,
            });
        }
    };
}
