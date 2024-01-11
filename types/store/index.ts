// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {KSuiteBridge} from '@infomaniak/ksuite-bridge';

import {GlobalState as BaseGlobalState} from '@mattermost/types/store';

import {PluginsState} from './plugins';
import {ViewsState} from './views';

export type DraggingState = {
    state?: string;
    type?: string;
    id?: string;
}

export type GlobalState = BaseGlobalState & {
    plugins: PluginsState;
    ksuite_bridge: {
        bridge: KSuiteBridge;
    };
    storage: {
        storage: Record<string, any>;
        initialized: boolean;
    };
    views: ViewsState;
};
