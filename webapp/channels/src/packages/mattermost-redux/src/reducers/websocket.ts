// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {MMReduxAction} from 'mattermost-redux/action_types';
import {GeneralTypes, UserTypes} from 'mattermost-redux/action_types';

function getInitialState() {
    return {
        connected: false,
        lastConnectAt: 0,
        firstDisconnect: 0,
        lastDisconnectAt: 0,
        connectionId: '',
        serverHostname: '',
    };
}

export default function reducer(state = getInitialState(), action: MMReduxAction) {
    if (!state.connected && action.type === GeneralTypes.WEBSOCKET_SUCCESS) {
        return {
            ...state,
            connected: true,
            lastConnectAt: action.timestamp,
        };
    } else if (state.connected && (action.type === GeneralTypes.WEBSOCKET_FAILURE || action.type === GeneralTypes.WEBSOCKET_CLOSED)) {
        return {
            ...state,
            connected: false,
            lastDisconnectAt: action.timestamp,
            serverHostname: '',
            firstDisconnect: state.lastDisconnectAt || action.timestamp,
        };
    }

    if (action.type === UserTypes.LOGOUT_SUCCESS) {
        // eslint-disable-next-line no-console
        console.log('RESET WS STATE');
        return getInitialState();
    }

    if (action.type === GeneralTypes.SET_CONNECTION_ID) {
        return {
            ...state,
            connectionId: action.payload.connectionId,
        };
    }

    if (action.type === GeneralTypes.SET_SERVER_HOSTNAME) {
        return {
            ...state,
            serverHostname: action.payload.serverHostname,
        };
    }

    return state;
}
