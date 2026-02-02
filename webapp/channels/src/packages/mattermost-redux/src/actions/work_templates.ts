// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ExecuteWorkTemplateRequest} from '@mattermost/types/work_templates';

import {WorkTemplatesType} from 'mattermost-redux/action_types';
import {bindClientFunc} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';
import type {ActionFuncAsync} from 'mattermost-redux/types/actions';

export function getWorkTemplateCategories(): ActionFuncAsync {
    return bindClientFunc({

        // @ts-expect-error seems missing but for safety i silented it
        clientFunc: Client4.getWorkTemplateCategories,
        onRequest: WorkTemplatesType.WORK_TEMPLATE_CATEGORIES_REQUEST,
        onSuccess: [WorkTemplatesType.RECEIVED_WORK_TEMPLATE_CATEGORIES],
    });
}

export function getWorkTemplates(categoryId: string): ActionFuncAsync {
    return bindClientFunc({

        // @ts-expect-error seems missing but for safety i silented it
        clientFunc: Client4.getWorkTemplates,
        onRequest: WorkTemplatesType.WORK_TEMPLATES_REQUEST,
        onSuccess: [WorkTemplatesType.RECEIVED_WORK_TEMPLATES],
        params: [categoryId],
    });
}

export function executeWorkTemplate(req: ExecuteWorkTemplateRequest): ActionFuncAsync {
    return bindClientFunc({

        // @ts-expect-error seems missing but for safety i silented it
        clientFunc: Client4.executeWorkTemplate,
        params: [req],
    });
}

export function clearCategories(): ActionFuncAsync {
    return async (dispatch) => {
        dispatch({type: WorkTemplatesType.CLEAR_WORK_TEMPLATE_CATEGORIES});
        return {data: []};
    };
}

export function clearWorkTemplates(): ActionFuncAsync {
    return async (dispatch) => {
        dispatch({type: WorkTemplatesType.CLEAR_WORK_TEMPLATES});
        return {data: []};
    };
}

// stores the linked product information in the state so it can be used to show the tourtip
export function onExecuteSuccess(data: Record<string, number>): ActionFuncAsync {
    return async (dispatch) => {
        dispatch({type: WorkTemplatesType.EXECUTE_SUCCESS, data});
        return {data: []};
    };
}
