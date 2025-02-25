import type {DispatchFunc} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';
import {generateId} from 'utils/utils';

import PostMenu from 'plugins/ai/components/post_menu';

let isPluginRegistered = false;

export function registerInternalAiPlugin() {
    return async (dispatch: DispatchFunc) => {
        if (isPluginRegistered) {
            return;
        }
        dispatch({
            type: ActionTypes.RECEIVED_PLUGIN_COMPONENT,
            name: 'PostAction',
            data: {
                id: generateId(),
                pluginId: 'ia',
                component: PostMenu,
            },
        });
        isPluginRegistered = true;
    };
}
