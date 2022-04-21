// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getInfomaniakTokens} from 'selectors/ik';
import {GlobalState} from 'types/store';
import {ActionTypes} from 'utils/constants';

const accessTokenKey = '@infomaniak/token';
const refreshTokenKey = '@infomaniak/refresh-token';

// Client4 needs to be called here to fetch token

// Actions
export function setTokens(x: { accessToken: string; refreshToken: string }): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            await localStorage.setItem(accessTokenKey, x.accessToken);
            await localStorage.setItem(refreshTokenKey, x.refreshToken);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);
        }

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
            const state = getState() as GlobalState;
            const {accessToken, refreshToken} = getInfomaniakTokens(state);
            if (!accessToken) {
                // TODO: Do login here
                // TODO: Get new accessToken
                // TODO: Dispatch action to start watch refresh token
                // TODO: Update token for client4 here
            }

            dispatch(setTokens({accessToken, refreshToken}));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);
        }
        return {};
    };
}
