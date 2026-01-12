import type {KSuiteBridge} from '@infomaniak/ksuite-bridge';

import type {GlobalState} from '@mattermost/types/store';

export function getKSuiteBridge(state: GlobalState): KSuiteBridge {
    return state.entities.ksuiteBridge.bridge;
}

export function getKSuiteDnd(state: GlobalState): boolean {
    return state.entities.ksuiteBridge.dnd;
}

export function getKSuiteMode(state: GlobalState): string {
    return state.entities.ksuiteBridge.ksuiteMode;
}

export function getKSuiteSpaceId(state: GlobalState): string {
    return state.entities.ksuiteBridge.spaceId;
}
