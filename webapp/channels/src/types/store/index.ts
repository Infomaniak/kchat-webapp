// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {KSuiteBridge} from '@infomaniak/ksuite-bridge';

import type {GlobalState as BaseGlobalState} from '@mattermost/types/store';

import type {PluginsState} from './plugins';
import type {ViewsState} from './views';

export type DraggingState = {
    state?: string;
    type?: string;
    id?: string;
}

export type GlobalState = BaseGlobalState & {
    plugins: PluginsState;
    ksuite_bridge: KSuiteBridge;
    kdrive: {
        toast: {
            message: string;
        };
    };
    storage: {
        storage: Record<string, any>;
        initialized: boolean;
    };
    views: ViewsState;
};
