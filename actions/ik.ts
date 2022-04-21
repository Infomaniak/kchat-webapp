// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getInfomaniakTokens} from 'selectors/ik';
import {ActionTypes} from 'utils/constants';

const accessTokenKey = '@infomaniak/token';
const refreshTokenKey = '@infomaniak/refresh-token';

// Actions
export function setTokens(x: { accessToken: string; refreshToken: string }): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            await localStorage.setItem(accessTokenKey, x.accessToken);
            await localStorage.setItem(refreshTokenKey, x.refreshToken);
        } catch { }

        dispatch({
            type: ActionTypes.SET_INFOMANIAK_TOKEN,
            x,
        });
        return {data: x};
    };
}
export function loadTokens(): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        try {
            const state = getState();
            const {accessToken, refreshToken} = getInfomaniakTokens(state);
            if (!accessToken) {
                // TODO: Do login
                // TODO: Get new accessToken
                // TODO: Dispatch action to start watch refresh token
            }

            dispatch(setTokens({accessToken, refreshToken}));
        } catch { }

        return {};
    };
}
