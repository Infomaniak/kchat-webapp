// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ServerError} from '@mattermost/types/errors';

import {UserTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import type {DispatchFunc, GetStateFunc, ActionFuncAsync} from 'mattermost-redux/types/actions';

import {getHistory} from 'utils/browser_history';

import {logError} from './errors';
type ActionType = string;
const HTTP_UNAUTHORIZED = 401;
export function forceLogoutIfNecessary(err: ServerError, dispatch: DispatchFunc, getState: GetStateFunc) {
    const {currentUserId} = getState().entities.users;

    redirectToErrorPageIfNecessary(err);

    if ('status_code' in err && err.status_code === HTTP_UNAUTHORIZED && err.url && err.url.indexOf('/login') === -1 && currentUserId) {
        Client4.setToken('');
        dispatch({type: UserTypes.LOGOUT_SUCCESS, data: {}});
    }
}

const statusCodes = {
    HTTP_MAINTENANCE: 503,
    HTTP_BLOCKED: 401,
    FORCE_MIGRATION: 1,
};

export function redirectToErrorPageIfNecessary(err: ServerError) {
    switch (err.status_code) {
    case statusCodes.HTTP_MAINTENANCE:
        getHistory().replace('/error?type=maintenance');
        break;
    case statusCodes.HTTP_BLOCKED:
        if (err.server_error_id === 'product_locked' || err.error?.code === 'product_locked') {
            getHistory().replace('/error?type=blocked');
        }
        break;
    case statusCodes.FORCE_MIGRATION:
        getHistory().replace('/error?type=force_migration');
        break;
    }
}

function dispatcher(type: ActionType, data: any, dispatch: DispatchFunc) {
    if (type.indexOf('SUCCESS') === -1) { // we don't want to pass the data for the request types
        dispatch(requestSuccess(type, data));
    } else {
        dispatch(requestData(type));
    }
}

export function requestData(type: ActionType) {
    return {
        type,
        data: null,
    };
}

export function requestSuccess(type: ActionType, data: any) {
    return {
        type,
        data,
    };
}

export function requestFailure(type: ActionType, error: ServerError): any {
    return {
        type,
        error,
    };
}

/**
 * Returns an ActionFunc which calls a specfied (client) function and
 * dispatches the specifed actions on request, success or failure.
 *
 * @export
 * @param {Object} obj                                       an object for destructirung required properties
 * @param {() => Promise<mixed>} obj.clientFunc              clientFunc to execute
 * @param {ActionType} obj.onRequest                         ActionType to dispatch on request
 * @param {(ActionType | Array<ActionType>)} obj.onSuccess   ActionType to dispatch on success
 * @param {ActionType} obj.onFailure                         ActionType to dispatch on failure
 * @param {...Array<any>} obj.params
 * @returns {ActionFunc} ActionFunc
 */

export function bindClientFunc<Func extends(...args: any[]) => Promise<any>>({
    clientFunc,
    onRequest,
    onSuccess,
    onFailure,
    params,
}: {
    clientFunc: Func;
    onRequest?: ActionType;
    onSuccess?: ActionType | ActionType[];
    onFailure?: ActionType;
    params?: Parameters<Func>;
}): ActionFuncAsync<Awaited<ReturnType<Func>>> {
    return async (dispatch, getState) => {
        if (onRequest) {
            dispatch(requestData(onRequest));
        }

        let data: Awaited<ReturnType<Func>>;
        try {
            if (params) {
                data = await clientFunc(...params);
            } else {
                data = await clientFunc();
            }
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            if (onFailure) {
                dispatch(requestFailure(onFailure, error));
            }
            dispatch(logError(error));
            return {error};
        }

        if (Array.isArray(onSuccess)) {
            onSuccess.forEach((s) => {
                dispatcher(s, data, dispatch);
            });
        } else if (onSuccess) {
            dispatcher(onSuccess, data, dispatch);
        }

        return {data};
    };
}

// Debounce function based on underscores modified to use es6 and a cb

export function debounce(func: (...args: any) => unknown, wait: number, immediate?: boolean, cb?: () => unknown) {
    let timeout: NodeJS.Timeout|null;
    return function fx(...args: any[]) {
        const runLater = () => {
            timeout = null;
            if (!immediate) {
                Reflect.apply(func, null, args);
                if (cb) {
                    cb();
                }
            }
        };
        const callNow = immediate && !timeout;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(runLater, wait);
        if (callNow) {
            Reflect.apply(func, null, args);
            if (cb) {
                cb();
            }
        }
    };
}

export class FormattedError extends Error {
    intl: {
        id: string;
        defaultMessage: string;
        values: any;
    };

    constructor(id: string, defaultMessage: string, values: any = {}) {
        super(defaultMessage);
        this.intl = {
            id,
            defaultMessage,
            values,
        };
    }
}

