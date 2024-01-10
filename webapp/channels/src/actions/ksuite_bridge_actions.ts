// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {DispatchFunc} from 'mattermost-redux/types/actions';

import {BridgeActionTypes} from 'utils/constants';

export function storeBridge(bridge: any) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: BridgeActionTypes.STORE_BRIDGE,
            bridge,
        });

        bridge.sendMessage({
            type: 'app-ready',
        });

        return {data: true};
    };
}
